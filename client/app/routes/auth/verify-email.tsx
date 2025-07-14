import { Card, CardContent, CardHeader } from '@/components/ui/card';
import React, {useEffect, useState} from 'react'
import { Link, useSearchParams } from 'react-router';
import {ArrowLeft, Check, CheckCircle, Loader, X, XCircle} from 'lucide-react';
import { useVerifyEmailMutation } from '@/hooks/use-auth';
import { toast } from 'sonner';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [isSuccess, setIsSuccess] = useState(false);
  const {mutate, isPending: isVerifying}= useVerifyEmailMutation();

  useEffect(() => {

    if(token) {
      mutate({token}, {
        onSuccess: () => {
          setIsSuccess(true);
        },
        onError: (error : any) => {
          const errorMessage = error.response?.data?.message || "An error occurred";
          setIsSuccess(false);
          console.log(error);

          toast.error(errorMessage);

        },
      });
    }

  }, [searchParams]);

  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h1 className='text-2xl font-bold mb-4'>Verify Email</h1>
      <p className='text-sm text-gray-500'>Verifying your email...</p>

      <Card className='w-full max-w-md'>
        {/* <CardHeader>
          <Link to={"/sign-in"} className='flex items-center gap-2 text-sm'>
          <ArrowLeft className='w-4 h-4 mr-2' />
          Back to Sign in</Link>
        </CardHeader> */}

        <CardContent>
          <div className="flex flex-col items-center justify-center py-6">
            {isVerifying ? (
              <>
              <Loader className='w-10 h-10 text-gray-500 animate-spin'/>
              <h3 className='text-lg font-semibold'>Verifying email...</h3>
              <p className='text-sm text-gray-500'>
                Please wait while we verify your email.
              </p>
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle className='w-10 h-10 text-green-500 mb-4' />
                <h3 className='text-lg font-semibold'>Email Verified Successfully!</h3>
                <p className='text-sm text-gray-500'>You can now sign in to your account.</p>

                <Link to={"/sign-in"} className='mt-4 inline-flex items-center gap-2 text-sm text-blue-500 hover:underline'>
                  <ArrowLeft className='w-4 h-4' />
                  Back to Sign in
                </Link>
              </>

            ) : (
              <>
                <XCircle className='w-10 h-10 text-red-500 mb-4' />
                <h3 className='text-lg font-semibold'>Email Verification Failed</h3>
                <p className='text-sm text-gray-500'>Your Email Verification failed. Please try again.</p>

                <Link to={"/sign-in"} className='mt-4 inline-flex items-center gap-2 text-sm text-blue-500 hover:underline'>
                  <ArrowLeft className='w-4 h-4' />
                  Back to Sign in
                </Link>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default VerifyEmail;