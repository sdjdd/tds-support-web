import { UserSchema } from '@/api/user';
import { atom, useRecoilState, useRecoilValue } from 'recoil';

export const currentUserState = atom<UserSchema | undefined>({
  key: 'currentUser',
  default: undefined,
});

export const useCurrentUserState = () => useRecoilState(currentUserState);

export const useCurrentUser = () => useRecoilValue(currentUserState);
