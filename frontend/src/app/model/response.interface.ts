interface Response<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface AuthResponse {
  token?: string;
  accountId: number;
  displayName?: string;
  role?: string;
  admin?: boolean;
  status: 'success' | 'registered';
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export type { Response };
