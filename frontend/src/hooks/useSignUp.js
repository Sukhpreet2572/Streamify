import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signup } from "../lib/api";

const useSignUp = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      console.log("Signup successful:", data);
      // Manually set the auth user data in the cache
      queryClient.setQueryData(["authUser"], data);
      // Force a refetch of the auth user
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      console.error("Signup error:", error);
    }
  });

  return { isPending, error, signupMutation: mutate };
};

export default useSignUp;