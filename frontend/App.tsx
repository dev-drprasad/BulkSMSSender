import React, {useEffect, useRef, useState} from 'react';

import {NativeBaseProvider} from 'native-base';
import RNFS from 'react-native-fs';
import {PermissionsAndroid} from 'react-native';
import {NativeModules} from 'react-native';

const {DirectSMS} = NativeModules;

import ProjectList from './ProjectList';
import Settings from './Settings';

const sendSMSPromise = (number: string, message: string) =>
  new Promise<number>((resolve, reject) => {
    DirectSMS.send(number, message, (status: string, num: number) => {
      console.log(typeof num);
      if (status === 'SMS_SENT') {
        resolve(num);
      } else {
        reject();
      }
    });
  });

const placeholderRegex = /{(\w+)}/g;

const substitute = (string: string, obj: {[key: string]: any}) => {
  return string.replace(
    placeholderRegex,
    (placeholderWithDelimiters: string, placeholderWithoutDelimiters: string) =>
      obj[placeholderWithoutDelimiters] || placeholderWithDelimiters,
  );
};

const delay = (time: number) =>
  new Promise<void>(r => {
    setTimeout(() => r(), time);
  });

const PROJECTS_FILE_PATH = RNFS.DocumentDirectoryPath + '/state.json';

const HOME_ROUTE = '';
const SETTINGS_ROUTE = 'settings';

const saveState = (state: State) => {
  return RNFS.writeFile(PROJECTS_FILE_PATH, JSON.stringify(state));
};

export default function App() {
  const [state, setState] = useState<State>();
  const [route, setRoute] = useState('');

  const mounted = useRef(false);

  const goToSettings = () => setRoute(SETTINGS_ROUTE);
  const goToHome = () => setRoute(HOME_ROUTE);

  useEffect(() => {
    PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.SEND_SMS,
      PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
    ]);
  }, []);

  const consumeSMS = (projectName: string, number: string, usedSMS: number) => {
    setState(draftState => {
      if (!draftState) {
        return undefined;
      }

      const projectIndex = draftState.projects.findIndex(
        project => project.projectName === projectName,
      );
      const updatedProject = {
        ...draftState.projects[projectIndex],
        rows: {
          ...draftState.projects[projectIndex].rows,
          [number]: {
            ...draftState.projects[projectIndex].rows[number],
            sent: true,
          },
        },
      };

      const todayDate = new Date().getDate().toString();

      const usedSMSToday = draftState.usedSMS?.[todayDate] || 0;

      const updatedState = {
        ...draftState,

        usedSMS: {[todayDate]: usedSMSToday + usedSMS},
        projects: [
          ...draftState.projects.slice(0, projectIndex),
          updatedProject,
          ...draftState.projects.slice(projectIndex + 1),
        ],
      };

      saveState(updatedState);
      return updatedState;
    });
  };

  useEffect(() => {
    RNFS.readFile(PROJECTS_FILE_PATH)
      .then(data => {
        setState(JSON.parse(data));
      })
      .catch(err => {
        if (err.code === 'ENOENT') {
          RNFS.writeFile(
            PROJECTS_FILE_PATH,
            JSON.stringify({
              version: 1,
              projects: [],
              settings: {limitSMSPerDay: 100},
            }),
          ).catch(console.error);
        } else {
          console.error(JSON.stringify(err));
        }
      });
  }, []);

  useEffect(() => {
    mounted.current = true;
  }, []);

  const todayDate = new Date().getDate().toString();

  if (!state) {
    return null;
  }

  const remainingSMS =
    state.settings.limitSMSPerDay - (state.usedSMS?.[todayDate] || 0);

  const sendSMS = async (project: Project) => {
    const {rows, template, projectName} = project;

    let lastSMSUsed = 0;
    for (const number in rows) {
      if (Object.prototype.hasOwnProperty.call(rows, number)) {
        const data = rows[number];

        if (!data.sent && remainingSMS > lastSMSUsed) {
          const message = substitute(template, data);

          try {
            console.log(`sending sms to ${number}`);
            lastSMSUsed = await sendSMSPromise(number, message);

            await consumeSMS(projectName, number, lastSMSUsed);
            await delay(1000);
          } catch (error) {
            console.error(error);
          }
        }
      }
    }
  };

  const saveProjects = (projects: Project[]) => {
    const updatedState = {...state, projects};

    saveState(updatedState).then(() => setState(updatedState));
  };

  const deleteProject = (projectName: string) => {
    const projectIndex = state.projects.findIndex(
      project => project.projectName === projectName,
    );
    const updatedState = {
      ...state,
      projects: [
        ...state.projects.slice(0, projectIndex),
        ...state.projects.slice(projectIndex + 1),
      ],
    };
    saveState(updatedState).then(() => setState(updatedState));
  };

  const saveSettings = (settings: Settings) => {
    setState({...state, settings});
    RNFS.writeFile(
      PROJECTS_FILE_PATH,
      JSON.stringify({...state, settings}),
    ).catch(console.error);
  };

  return (
    <NativeBaseProvider>
      {route === HOME_ROUTE && (
        <ProjectList
          onMenuClick={goToSettings}
          onNewProjectAdd={saveProjects}
          projects={state.projects}
          onDelete={deleteProject}
          remainingSMS={remainingSMS}
          onSendSMS={sendSMS}
        />
      )}
      {route === SETTINGS_ROUTE && (
        <Settings
          onBack={goToHome}
          settings={state.settings}
          onSave={saveSettings}
        />
      )}
    </NativeBaseProvider>
  );
}
