import React, {useState} from 'react';

import {Box, Text, HStack, VStack, Button} from 'native-base';

import YesNoConfirm from './YesNoConfirm';

const checkSMSSent = ({sent}) => sent;

type ProjectListItemProps = {
  project: Project;
  onDelete: (n: string) => void;
  onSendSMS: (p: Project) => void;
  remainingSMS: number;
};

function ProjectListItem({
  project,
  onDelete,
  onSendSMS,
  remainingSMS,
}: ProjectListItemProps) {
  const [shouldShowDeleteConfirm, setShouldShowDeleteConfirm] = useState(false);
  const [shouldShowStartConfirm, setShouldShowStartConfirm] = useState(false);
  const contactList = Object.values(project.rows);
  const totalSent = contactList.filter(checkSMSSent).length;
  const totalContacts = contactList.length;

  const closeDeleteConfirm = () => setShouldShowDeleteConfirm(false);
  const showDeleteConfirm = () => setShouldShowDeleteConfirm(true);

  const closeStartConfirm = () => setShouldShowStartConfirm(false);
  const showStartConfirm = () => setShouldShowStartConfirm(true);

  const sendSMS = async () => {
    closeStartConfirm();
    onSendSMS(project);
  };

  const handleDelete = () => {
    closeDeleteConfirm();
    onDelete(project.projectName);
  };

  return (
    <>
      <Box
        key={project.projectName}
        borderBottomWidth="1"
        _dark={{
          borderColor: 'gray.600',
        }}
        borderColor="coolGray.200"
        pl="4"
        pr="5"
        py="2">
        <HStack justifyContent="space-between">
          <VStack>
            <Text textAlign="left">{project.projectName}</Text>
            <Text>
              sent: {totalSent} / {totalContacts}
            </Text>
          </VStack>
          <VStack space="2">
            <Button
              isDisabled={totalContacts === totalSent || remainingSMS <= 0}
              onPress={showStartConfirm}>
              ▶
            </Button>
            <Button colorScheme="red" color="white" onPress={showDeleteConfirm}>
              ❌
            </Button>
          </VStack>
        </HStack>
        <HStack>
          <Text>{project.template}</Text>
        </HStack>
      </Box>
      <YesNoConfirm
        isOpen={shouldShowDeleteConfirm}
        onClose={closeDeleteConfirm}
        onConfirm={handleDelete}
        title="Delete"
      />
      <YesNoConfirm
        isOpen={shouldShowStartConfirm}
        onClose={closeStartConfirm}
        onConfirm={sendSMS}
        title="Run"
      />
    </>
  );
}

export default ProjectListItem;
