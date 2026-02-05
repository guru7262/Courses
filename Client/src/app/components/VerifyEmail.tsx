import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Footer } from '@/app/components/Footer';
import axios from 'axios';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [email, setEmail] = useState(location.state?.email || '');
  const [verifying, setVerifying] = useState(!!token);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await axios.get(
        `/api/auth/verify-email/${verificationToken}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setVerified(true);
        localStorage.setItem('token', response.data.token);
        
        // Redirect to home after 2 seconds
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email verification failed. The link may have expired.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResendSuccess(false);
    setResending(true);

    try {
      await axios.post('/api/auth/resend-verification', { email });
      setResendSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  // If verifying with token
  if (verifying) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-md p-6 bg-card rounded-lg shadow text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            </div>
            <h1 className="text-2xl font-semibold mb-2">Verifying your email</h1>
            <p className="text-sm text-muted-foreground">Please wait...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // If verified successfully
  if (verified) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-md p-6 bg-card rounded-lg shadow text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h1 className="text-2xl font-semibold mb-2">Email verified!</h1>
            <p className="text-sm text-muted-foreground mb-4">
              Your email has been successfully verified. Redirecting to home...
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Default verification prompt
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md p-6 bg-card rounded-lg shadow">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold mb-2">Verify your email</h1>
            <p className="text-sm text-muted-foreground">
              {location.state?.message || 
                "We've sent a verification link to your email address. Please check your inbox and click the link to verify your account."}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {resendSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">Verification email sent! Please check your inbox.</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>Didn't receive the email?</p>
            </div>

            <form onSubmit={handleResend} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                    setResendSuccess(false);
                  }}
                  className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={resending}
                className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending ? 'Sending...' : 'Resend verification email'}
              </button>
            </form>
          </div>

          <div className="mt-6 text-center text-sm">
            <Link to="/login" className="text-primary hover:underline font-medium">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
