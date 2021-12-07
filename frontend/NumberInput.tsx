import React from 'react';
import {
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from 'native-base';

function NumberInputComponent({width, value, onChange, max, min, isInvalid}) {
  return (
    <NumberInput min={min} max={max} width={width} value={value}>
      <NumberInputField isInvalid={isInvalid} onChange={onChange} height="10" />
    </NumberInput>
  );
}

export default NumberInputComponent;
