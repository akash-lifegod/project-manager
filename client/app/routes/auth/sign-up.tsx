import React, { use } from 'react'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signUpSchema } from '@/lib/schema';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router';

type signUpFormData = z.infer<typeof signUpSchema>;
const SignUp = () => {
  const form = useForm<signUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      confirmPassword: '',
    },
  });

  const handleOnSubmit = (values: signUpFormData) => {
    console.log('Form submitted:', values);
  };

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4'>
      <Card className='w-full max-w-md shadow-xl'>
        <CardHeader className='text-center mb-5'>
          <CardTitle className='text-2xl font-bold'>Create an Account</CardTitle>
          <CardDescription className='text-sm text-muted-foreground'>
            Create an account to continue
          </CardDescription>
        </CardHeader>

        <CardContent>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleOnSubmit)} className='space-y-6'>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input type ="name" {...field} placeholder="John Doe"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type ="password" {...field} placeholder="********"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type ="confirmPassword" {...field} placeholder="********"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className='w-full'>
                Create Account
              </Button>
            </form>
          </Form>

          <CardFooter className='flex items-center justify-center mt-6'>
            <p className='text-sm text-muted-foreground'>
              Already have an account? 
              <Link to="/sign-in" className='text-blue-500 hover:underline ml-1 font-semibold'>
                 Sign In
              </Link>
            </p>
          </CardFooter>

        </CardContent>
      </Card>
    </div>
  )
}

export default SignUp;