import { useQuery } from "@tanstack/react-query";
import { getAuthUser } from "../lib/api";

const useAuthUser = () => {
  const authUser = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    retry: false, // auth check
    staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes
    cacheTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
    onError: (error) => {
      console.error("Auth user query error:", error);
    },
    onSuccess: (data) => {
      console.log("Auth user query success:", data);
    }
  });

  console.log("useAuthUser hook:", { 
    isLoading: authUser.isLoading, 
    data: authUser.data, 
    error: authUser.error 
  });

  // Return null for authUser if there's an error or no data
  return { 
    isLoading: authUser.isLoading, 
    authUser: authUser.error ? null : authUser.data?.user 
  };
};
export default useAuthUser;