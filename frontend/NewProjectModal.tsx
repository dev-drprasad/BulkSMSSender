import React, {useState} from 'react';
import {
  Button,
  Input,
  Modal,
  TextArea,
  Divider,
  FormControl,
} from 'native-base';
import DocumentPicker from 'react-native-document-picker';
import * as RNFS from 'react-native-fs';
import Papa from 'papaparse';

const processData = (allText: string) => {
  const {data} = Papa.parse<string[]>(allText);
  const header = data[0];
  const processedData = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const processedRow: {[key: string]: string} = {};
    for (let j = 0; j < header.length; j++) {
      const columnName = header[j];
      processedRow[columnName] = row[j];
    }
    processedData.push(processedRow);
  }
  return processedData;
};

type State = {
  projectName: string;
  rows: string[];
  template: string;
  filePath: string;
  errors: {[key: string]: string};
};

const isEmpty = (value: undefined | null | object | string) => {
  return (
    value === undefined ||
    value === null ||
    (typeof value === 'object' && Object.keys(value).length === 0) ||
    (typeof value === 'string' && value.trim().length === 0)
  );
};

const validateForm = data => {
  const errors = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key];
      if (isEmpty(value)) {
        errors[key] = 'required';
      }
    }
  }
  return errors;
};

const initialState: State = {
  projectName: '',
  rows: [],
  template: '',
  filePath: '',
  errors: {},
};

function NewProjectModal({visible, onClose, onAdd}: {visible: boolean}) {
  const [formData, setFormData] = useState<State>(initialState);

  const showFilePicker = () => {
    DocumentPicker.pickSingle({})
      .then(res => {
        console.log(res);
        setFormData({...formData, filePath: res.uri});
      })

      .catch(err => {
        if (DocumentPicker.isCancel(err)) {
          // User cancelled the picker, exit any dialogs or menus and move on
        } else {
          throw err;
        }
      });
  };

  const handleProjectNameChange = (projectName: string) => {
    setFormData({...formData, projectName});
  };

  const handleTemplateChange = (template: string) => {
    setFormData({...formData, template});
  };

  const handleAdd = () => {
    let errors = validateForm({filePath: formData.filePath});
    if (!isEmpty(errors)) {
      setFormData({...formData, errors});
      return;
    }

    RNFS.readFile(formData.filePath, 'utf8').then(res => {
      const rows = processData(res);

      errors = validateForm({...formData, rows});
      if (!isEmpty(errors)) {
        setFormData({...formData, errors});
        return;
      }

      const contactMap = {};
      for (const row of rows) {
        contactMap[row.number] = row;
      }

      onAdd({
        projectName: formData.projectName,
        template: formData.template,
        rows: contactMap,
      });
    });
  };

  return (
    <Modal isOpen={visible} onClose={onClose} closeOnOverlayClick>
      <Modal.Content maxWidth="500px" minWidth="90%" padding="6">
        <FormControl isRequired isInvalid={!!formData.errors.projectName}>
          <Input
            placeholder="Project Name"
            marginBottom="3"
            onChangeText={handleProjectNameChange}
          />
        </FormControl>
        <FormControl
          isRequired
          isInvalid={!!formData.errors.filePath || !!formData.errors.rows}>
          <Input
            placeholder="CSV File"
            InputRightElement={
              <Button onPress={showFilePicker} marginRight="1">
                Choose
              </Button>
            }
            value={formData.filePath}
            marginBottom="3"
            isDisabled
          />
        </FormControl>
        <FormControl
          marginBottom="3"
          isRequired
          isInvalid={!!formData.errors.template}>
          <TextArea onChangeText={handleTemplateChange} multiline />
          <FormControl.HelperText _text={{fontSize: 'xs'}}>
            phone number column should be 'number'
          </FormControl.HelperText>
        </FormControl>
        <Divider marginBottom="3" />
        <Button onPress={handleAdd}>Add</Button>
      </Modal.Content>
      <Modal.CloseButton />
    </Modal>
  );
}
export default NewProjectModal;

// https://stackoverflow.com/questions/7975005/format-a-javascript-string-using-placeholders-and-an-object-of-substitutions
