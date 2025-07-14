import React, { use } from 'react'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signInSchema } from '@/lib/schema';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router';
import { useLoginMutation } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/provider/auth-context';

type signInFormData = z.infer<typeof signInSchema>;
const SignIn = () => {

  const navigate = useNavigate();
  const {login} = useAuth();

  const form = useForm<signInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const {mutate, isPending} = useLoginMutation(); 

  const handleOnSubmit = (values: signInFormData) => {
    mutate(values, {
      onSuccess: (data) => {
        login(data);
        console.log("data");
        toast.success("Login Successful");
        navigate("/dashboard");
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || "An Error Occurred";
        console.error(error);
        toast.error(errorMessage);
      }
    });
  };

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4'>
      <Card className='w-full max-w-md shadow-xl'>
        <CardHeader className='text-center mb-5'>
          <CardTitle className='text-2xl font-bold'>Welcome Back!</CardTitle>
          <CardDescription className='text-sm text-muted-foreground'>
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>

        <CardContent>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleOnSubmit)} className='space-y-6'>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type ="email" {...field} placeholder="email@example.com"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className='flex items-center justify-between'>
                      <FormLabel>Password</FormLabel>
                      <Link to="/forgot-password" className='text-sm text-blue-500 hover:underline'>
                        Forgot Password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input type ="password" {...field} placeholder="********"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className='w-full' disabled={isPending}>
                {isPending ? <Loader2 className='w-4 h-4 mr-2' /> : "Sign in"}
              </Button>
            </form>
          </Form>

          <CardFooter className='flex items-center justify-center mt-6'>
            <p className='text-sm text-muted-foreground'>
              Don't have an account?
              <Link to="/sign-up" className='text-blue-500 hover:underline ml-1 font-semibold'>
                Sign Up
              </Link>
            </p>
          </CardFooter>

        </CardContent>
      </Card>
    </div>
  )
}

export default SignIn;