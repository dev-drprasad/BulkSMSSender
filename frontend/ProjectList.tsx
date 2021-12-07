import React, {useEffect, useRef, useState} from 'react';

import {
  Box,
  FlatList,
  Text,
  HStack,
  VStack,
  Button,
  IconButton,
  AddIcon,
  HamburgerIcon,
} from 'native-base';

import ProjectListItem from './ProjectListItem';
import NewProjectModal from './NewProjectModal';
import AppBar from './AppBar';

type ProjectListProps = {
  projects: Project[];
  onMenuClick: () => void;
  onNewProjectAdd: (p: Project[]) => void;
  onDelete: (n: string) => void;
  remainingSMS: number;
  onSendSMS: (p: Project) => void;
};

function ProjectList({
  projects,
  onMenuClick,
  onNewProjectAdd,
  onDelete,
  remainingSMS,
  onSendSMS,
}: ProjectListProps) {
  const [shouldShowNewProjectModal, setShouldShowNewProjectModal] =
    useState(false);

  const mounted = useRef(false);

  const showNewProjectModal = () => {
    setShouldShowNewProjectModal(true);
  };

  const closeNewProjectModal = () => {
    setShouldShowNewProjectModal(false);
  };

  const handleAddProject = (newProject: Project) => {
    if (
      projects.find(
        existingProject =>
          newProject.projectName === existingProject.projectName,
      )
    ) {
      return;
    }
    const updatedProjects = [...projects, newProject];
    // setProjects(updatedProjects);
    closeNewProjectModal();

    onNewProjectAdd(updatedProjects);
  };

  // rows.forEach(row => {
  //   const message = substitute(template, row);
  //   console.log('message :>> ', message);
  //   DirectSMS.send(row.number, message, status => {
  //     console.log('status :>> ', status);
  //   });
  // });

  useEffect(() => {
    mounted.current = true;
  }, []);

  return (
    <>
      <AppBar
        title="Projects"
        leftActions={[
          <IconButton
            key="menu-icon"
            onPress={onMenuClick}
            icon={<HamburgerIcon color="white" />}
          />,
        ]}
        rightActions={[
          <IconButton
            key="add-icon"
            onPress={showNewProjectModal}
            icon={<AddIcon size="sm" color="white" />}
          />,
        ]}
      />
      <FlatList
        contentContainerStyle={{flexGrow: 0}}
        data={projects}
        renderItem={({item}) => {
          return (
            <ProjectListItem
              key={item.projectName}
              project={item}
              onDelete={onDelete}
              remainingSMS={remainingSMS}
              onSendSMS={onSendSMS}
            />
          );
        }}
      />

      <NewProjectModal
        visible={shouldShowNewProjectModal}
        onClose={closeNewProjectModal}
        onAdd={handleAddProject}
      />
    </>
  );
}

export default ProjectList;
