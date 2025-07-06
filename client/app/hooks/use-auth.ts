import { postData } from "@/lib/fetch-util";
import SignUp, { type signUpFormData } from "@/routes/auth/sign-up";
import { useMutation } from "@tanstack/react-query";


export const useSignUpMutation = () => {
  return useMutation({
    mutationFn: (data: signUpFormData) => postData('/auth/register',data),
  });
}