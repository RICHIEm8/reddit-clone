import { Input, Textarea, useColorModeValue, VStack } from '@chakra-ui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useWindowScroll } from 'react-use';
import * as yup from 'yup';
import { useAddComment } from '../hooks/useAddComment';
import { useAuth } from '../hooks/useAuth';

interface FormValues {
  comment: string;
}

const validationSchema = yup
  .object()
  .shape({
    comment: yup.string().max(10000).required(),
  })
  .required();

export const CommentsForm = () => {
  const { postId } = useParams<{ postId: string }>();
  const addCommentMutation = useAddComment(postId ?? '');
  const formOptions = { resolver: yupResolver(validationSchema) };
  const { authToken } = useAuth();

  const inputBorder = useColorModeValue('blue.800', 'blue.100');
  const submitFont = useColorModeValue('blue.800', 'blue.100');
  const submitButtonBg = useColorModeValue('white', 'gray.700');
  const submitHoverFont = useColorModeValue('white', 'blue.700');
  const submitHoverBg = useColorModeValue('blue.800', 'blue.100');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>(formOptions);

  const onSubmit = React.useCallback(
    (data: FormValues) => {
      if (authToken) {
        const request = {
          postId: postId ?? '',
          comment: data.comment,
        };
        return addCommentMutation.mutateAsync({ ...request, token: authToken }).then((res) => {
          window.location.reload();
        });
      }
    },
    [addCommentMutation]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack spacing={2}>
        <Textarea
          {...register('comment')}
          id="comment"
          placeholder="What do you think?"
          _placeholder={{ color: 'gray' }}
          focusBorderColor={inputBorder}
          borderRadius="0"
          bg={'white'}
          borderColor="gray"
          h={150}
          w={[300, 500, 650, 750, 900]}
        />
        <Input
          type="submit"
          value="Comment"
          fontSize={'sm'}
          w={100}
          alignSelf="flex-end"
          borderRadius={50}
          borderWidth={2}
          borderColor={submitFont}
          bg={submitButtonBg}
          color={submitFont}
          fontWeight="bold"
          _hover={{ bg: submitHoverBg, color: submitHoverFont }}
          _active={{ bg: submitHoverBg, color: submitHoverFont }}
          _focus={{ boxShadow: '0' }}
        />
      </VStack>
    </form>
  );
};
