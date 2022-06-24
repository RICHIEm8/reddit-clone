import axios from 'axios';
import _ from 'lodash';
import { useQuery } from 'react-query';
import { DatabasePost } from '../../server/services/database.service';
import { apiUrl } from '../constants';
import { useAuthContext } from '../context/AuthContext';

const getSinglePost = async (postId: string, token?: string): Promise<DatabasePost> => {
  const { data } = await axios(`${apiUrl}/post/${postId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token ?? ''}`,
    },
  });

  return data;
};

export const getPostQueryKey = (postId: string) => ['post', postId];

export const useGetSinglePost = (postId: string) => {
  const { authToken } = useAuthContext();

  return useQuery<DatabasePost, Error>(getPostQueryKey(postId), () =>
    getSinglePost(postId, authToken)
  );
};
