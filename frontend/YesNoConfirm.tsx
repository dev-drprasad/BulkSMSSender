import React from 'react';
import {AlertDialog, Button, Center} from 'native-base';

const YesNoConfirm = ({isOpen, title, onClose, onConfirm}) => {
  const cancelRef = React.useRef(null);
  return (
    <Center>
      <AlertDialog
        leastDestructiveRef={cancelRef}
        isOpen={isOpen}
        onClose={onClose}>
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>{title}</AlertDialog.Header>
          <AlertDialog.Footer>
            <Button.Group space={2}>
              <Button
                variant="unstyled"
                colorScheme="coolGray"
                onPress={onClose}
                ref={cancelRef}>
                No
              </Button>
              <Button colorScheme="primary" onPress={onConfirm}>
                Yes
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </Center>
  );
};

export default YesNoConfirm;
