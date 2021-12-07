import React, {useState} from 'react';
import {CheckIcon, ChevronLeftIcon, FormControl, IconButton} from 'native-base';
import {NativeSyntheticEvent, TextInputChangeEventData} from 'react-native';
import AppBar from './AppBar';
import NumberInput from './NumberInput';

type Props = {
  onBack: () => void;
  settings: Settings;
  onSave: (settings: Settings) => void;
};

function Settings({onBack, settings: initialSettings, onSave}: Props) {
  const [settings, setSettings] = useState(initialSettings);
  const [error, setError] = useState('');

  const handleSave = () => {
    if (settings.limitSMSPerDay < 0 || settings.limitSMSPerDay > 100) {
      setError('not valid');
      return;
    }
    onSave(settings);
    onBack();
  };

  const handleLimitSMSPerDayChange = ({
    nativeEvent,
  }: NativeSyntheticEvent<TextInputChangeEventData>) => {
    const limitSMSPerDay = Number(nativeEvent.text);

    setSettings({limitSMSPerDay: limitSMSPerDay});
  };

  return (
    <>
      <AppBar
        title="Settings"
        leftActions={[
          <IconButton
            key="back-icon"
            onPress={onBack}
            icon={<ChevronLeftIcon size="md" color="white" />}
          />,
        ]}
        rightActions={[
          <IconButton
            key="save-icon"
            onPress={handleSave}
            icon={<CheckIcon size="sm" color="white" />}
          />,
        ]}
      />

      <FormControl
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        px="4"
        py="4">
        <FormControl.Label>Limit SMS per day</FormControl.Label>
        <NumberInput
          isInvalid={!!error}
          onChange={handleLimitSMSPerDayChange}
          width={100}
          max={100}
          min={0}
          value={settings.limitSMSPerDay}
        />
      </FormControl>
    </>
  );
}

export default Settings;
