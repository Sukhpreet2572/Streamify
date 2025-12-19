import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../lib/api";

const useLogin = () => {
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      // Manually set the auth user data in the cache
      queryClient.setQueryData(["authUser"], data);
      // Also invalidate to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  return { error, isPending, loginMutation: mutate };
};

export default useLogin;