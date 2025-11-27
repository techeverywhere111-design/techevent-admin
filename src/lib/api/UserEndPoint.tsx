import api from "../utils/api";

export interface AccountUser {
  id: string;
  accountId: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  imageId: string;
  imageUrl: string;
  createdOn: string;
  lastLogin: string;
}

export interface AccountUsersResponse {
  totalPages: number;
  size: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
  content: AccountUser[];
}

export const GetAccountUsers = async (
  pageNo: number,
  pageSize: number
): Promise<AccountUsersResponse> => {
  const { data } = await api.get<AccountUsersResponse>(
    "/api/v1/account-users",
    {
      params: { pageNo, pageSize },
    }
  );
  return data;
};

export const SearchAccountUsers = async (
  text: string,
  pageNo: number,
  pageSize: number
) => {
  const { data } = await api.get<AccountUsersResponse>(
    "/api/v1/account-users/search",
    { params: { text, pageNo, pageSize } }
  );
  return data;
};

export const GetBulkAccountUsers = async (
  ids: string[]
): Promise<AccountUser[]> => {
  const { data } = await api.post<AccountUser[]>(
    "/api/v1/account-users/bulk-ids",
    ids
  );
  return data;
};
