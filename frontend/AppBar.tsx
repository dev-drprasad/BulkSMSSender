import React from 'react';
import {
  HStack,
  IconButton,
  Icon,
  AddIcon,
  Box,
  HamburgerIcon,
  ChevronLeftIcon,
  Text,
  Heading,
  View,
} from 'native-base';

function AppBar({title, leftActions, rightActions}) {
  return (
    <HStack
      bg="primary.500"
      px="1"
      py="3"
      justifyContent="space-between"
      alignItems="center">
      <HStack alignItems="center">{leftActions}</HStack>
      <View flexGrow={1}>
        <Heading color="white">{title}</Heading>
      </View>
      <HStack>{rightActions}</HStack>
    </HStack>
  );
}

export default AppBar;
