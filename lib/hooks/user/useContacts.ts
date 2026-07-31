import { useQuery, useMutation, useQueryClient, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { 
    getContactsApi, 
    addContactApi, 
    removeContactApi, 
    GetContactsResponse, 
    AddContactResponse 
} from '../../api/user/userApi';

const CONTACTS_QUERY_KEY = ['contacts'] as const;

/**
 * Hook to retrieve user's contacts
 */
export const useGetContacts = (
    options?: Omit<UseQueryOptions<GetContactsResponse, Error>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: CONTACTS_QUERY_KEY,
        queryFn: getContactsApi,
        ...options,
    });
};

/**
 * Hook to add a contact to user's list
 */
export const useAddContact = (
    options?: Omit<UseMutationOptions<AddContactResponse, Error, { contactId: string; customName?: string }>, 'mutationFn'>
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addContactApi,
        onSuccess: (data, variables, onMutateResult, context) => {
            // Invalidate contacts query to refresh user's contact list
            queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEY });
            if (options?.onSuccess) {
                options.onSuccess(data, variables, onMutateResult, context);
            }
        },
        ...options,
    });
};

/**
 * Hook to remove a contact from user's list
 */
export const useRemoveContact = (
    options?: Omit<UseMutationOptions<any, Error, string>, 'mutationFn'>
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: removeContactApi,
        onSuccess: (data, variables, onMutateResult, context) => {
            // Invalidate contacts query to refresh user's contact list
            queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEY });
            if (options?.onSuccess) {
                options.onSuccess(data, variables, onMutateResult, context);
            }
        },
        ...options,
    });
};
