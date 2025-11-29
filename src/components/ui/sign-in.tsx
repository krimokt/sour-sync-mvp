import React, { useState } from 'react';
import { Eye, EyeOff, User, Building2, Link as LinkIcon, Check } from 'lucide-react';
import Image from 'next/image';

// --- HELPER COMPONENTS (ICONS) ---

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
    </svg>
);


// --- TYPE DEFINITIONS ---

export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

export type AuthMode = 'signin' | 'signup';

interface SignInPageProps {
  mode?: AuthMode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  testimonials?: Testimonial[];
  isLoading?: boolean;
  
  // Form Values
  slugAvailable?: boolean | null;
  checkingSlug?: boolean;
  companySlug?: string;

  // Handlers
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignIn?: () => void;
  onResetPassword?: () => void;
  onModeChange?: (mode: AuthMode) => void;
  onSlugChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCompanyNameChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// --- SUB-COMPONENTS ---

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-sm transition-all duration-300 focus-within:border-violet-500/50 focus-within:bg-white/80 dark:focus-within:bg-white/10 focus-within:ring-2 focus-within:ring-violet-500/20 group hover:border-gray-300 dark:hover:border-white/20 shadow-sm">
    {children}
  </div>
);

const TestimonialCard = ({ testimonial, delay }: { testimonial: Testimonial, delay: string }) => (
  <div className={`animate-testimonial ${delay} flex items-start gap-3 rounded-3xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-white/10 p-5 w-72 shadow-xl dark:shadow-2xl`}>
    <img src={testimonial.avatarSrc} className="h-10 w-10 object-cover rounded-2xl ring-2 ring-white dark:ring-white/10" alt="avatar" />
    <div className="text-sm leading-snug">
      <p className="flex items-center gap-1 font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
      <p className="text-violet-500 dark:text-violet-400 font-medium text-xs">{testimonial.handle}</p>
      <p className="mt-2 text-gray-600 dark:text-gray-300 leading-relaxed">{testimonial.text}</p>
    </div>
  </div>
);

// --- MAIN COMPONENT ---

export const SignInPage: React.FC<SignInPageProps> = ({
  mode = 'signin',
  title = <span className="font-light text-foreground tracking-tighter">Welcome</span>,
  description,
  heroImageSrc,
  testimonials = [],
  isLoading = false,
  
  slugAvailable,
  checkingSlug,
  companySlug,

  onSubmit,
  onGoogleSignIn,
  onResetPassword,
  onModeChange,
  onSlugChange,
  onCompanyNameChange,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isSignUp = mode === 'signup';
  const defaultDescription = isSignUp 
    ? "Create your account and start managing your sourcing business" 
    : "Access your account and continue your journey with us";

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row font-geist w-[100dvw] overflow-hidden bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-500">
      {/* Left column: form */}
      <section className="flex-1 flex items-center justify-center p-6 md:p-12 overflow-y-auto custom-scrollbar relative">
        {/* Background blobs for subtle effect */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-violet-500/5 blur-[100px] animate-pulse" style={{ animationDuration: '8s' }}></div>
            <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[100px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }}></div>
        </div>

        <div className="w-full max-w-md py-10 relative z-10">
          <div className="flex flex-col gap-8">
            <div className="animate-element animate-delay-100">
              <div className="flex items-center gap-3 mb-6">
                 <div className="relative w-10 h-10 bg-white dark:bg-white/10 rounded-xl shadow-sm flex items-center justify-center p-1.5">
                    <Image 
                        src="/images/logo/soursync-logo.svg" 
                        alt="Soursync Logo" 
                        fill
                        className="object-contain p-1"
                    />
                 </div>
                 <span className="font-bold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">Soursync</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white drop-shadow-sm">{title}</h1>
            </div>
            
            <p className="animate-element animate-delay-200 text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
              {description || defaultDescription}
            </p>

            <form className="space-y-6" onSubmit={onSubmit}>
              
              {/* Sign Up Fields */}
              {isSignUp && (
                <>
                  <div className="animate-element animate-delay-300 group">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block group-focus-within:text-violet-600 dark:group-focus-within:text-violet-400 transition-colors">Full Name</label>
                    <GlassInputWrapper>
                      <div className="relative">
                        <input name="fullName" type="text" placeholder="Enter your full name" className="w-full bg-transparent text-base p-4 pl-12 rounded-2xl focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 text-gray-900 dark:text-gray-100 font-medium" required />
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-violet-500 transition-colors duration-300" />
                      </div>
                    </GlassInputWrapper>
                  </div>

                  <div className="animate-element animate-delay-300 group">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block group-focus-within:text-violet-600 dark:group-focus-within:text-violet-400 transition-colors">Company Name</label>
                    <GlassInputWrapper>
                      <div className="relative">
                        <input 
                          name="companyName" 
                          type="text" 
                          placeholder="e.g., Yifan Trading Co." 
                          className="w-full bg-transparent text-base p-4 pl-12 rounded-2xl focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 text-gray-900 dark:text-gray-100 font-medium" 
                          onChange={onCompanyNameChange}
                          required 
                        />
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-violet-500 transition-colors duration-300" />
                      </div>
                    </GlassInputWrapper>
                  </div>

                  <div className="animate-element animate-delay-300 group">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block group-focus-within:text-violet-600 dark:group-focus-within:text-violet-400 transition-colors">Store URL</label>
                    <GlassInputWrapper>
                      <div className="relative flex items-center">
                        <LinkIcon className="absolute left-4 w-5 h-5 text-gray-400 group-focus-within:text-violet-500 transition-colors duration-300 z-10" />
                        <span className="pl-12 text-sm text-gray-400 font-medium">soursync.com/store/</span>
                        <input 
                          name="companySlug" 
                          type="text" 
                          placeholder="your-company" 
                          className="flex-1 bg-transparent text-base p-4 pl-1 rounded-2xl focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 text-gray-900 dark:text-gray-100 font-medium" 
                          value={companySlug}
                          onChange={onSlugChange}
                          required 
                        />
                        {/* Availability Indicator */}
                        <div className="absolute right-4">
                           {checkingSlug ? (
                             <span className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin block"></span>
                           ) : slugAvailable === true ? (
                             <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-1">
                               <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                             </div>
                           ) : slugAvailable === false ? (
                             <span className="text-red-500 text-xs font-bold bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full">Taken</span>
                           ) : null}
                        </div>
                      </div>
                    </GlassInputWrapper>
                    {slugAvailable === false && (
                      <p className="text-xs text-red-500 font-medium mt-2 ml-1 animate-fadeIn">This URL is already taken</p>
                    )}
                  </div>
                </>
              )}

              <div className="animate-element animate-delay-300 group">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block group-focus-within:text-violet-600 dark:group-focus-within:text-violet-400 transition-colors">Email Address</label>
                <GlassInputWrapper>
                  <input name="email" type="email" placeholder="Enter your email address" className="w-full bg-transparent text-base p-4 rounded-2xl focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 text-gray-900 dark:text-gray-100 font-medium" required />
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-400 group">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block group-focus-within:text-violet-600 dark:group-focus-within:text-violet-400 transition-colors">Password</label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Create a password" className="w-full bg-transparent text-base p-4 pr-12 rounded-2xl focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 text-gray-900 dark:text-gray-100 font-medium" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" /> : <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />}
                    </button>
                  </div>
                </GlassInputWrapper>
              </div>

              {!isSignUp && (
                <div className="animate-element animate-delay-500 flex items-center justify-between text-sm font-medium">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                        <input type="checkbox" name="rememberMe" className="peer sr-only" />
                        <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-md peer-checked:bg-violet-600 peer-checked:border-violet-600 transition-all"></div>
                        <Check className="w-3.5 h-3.5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Keep me signed in</span>
                  </label>
                  <a href="#" onClick={(e) => { e.preventDefault(); onResetPassword?.(); }} className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 hover:underline transition-colors">Reset password</a>
                </div>
              )}

              {isSignUp && (
                 <div className="animate-element animate-delay-500 flex items-center gap-3 text-sm font-medium">
                    <div className="relative">
                        <input type="checkbox" name="terms" className="peer sr-only" required />
                        <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-md peer-checked:bg-violet-600 peer-checked:border-violet-600 transition-all"></div>
                        <Check className="w-3.5 h-3.5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-gray-600 dark:text-gray-400">
                      I agree to the <a href="#" className="text-violet-600 dark:text-violet-400 hover:underline">Terms</a> and <a href="#" className="text-violet-600 dark:text-violet-400 hover:underline">Privacy Policy</a>.
                    </span>
                 </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading || (isSignUp && slugAvailable === false)}
                className="animate-element animate-delay-600 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 py-4 font-bold text-white text-lg shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 active:scale-[0.98] hover:scale-[1.01] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                    </div>
                ) : (isSignUp ? 'Create Account' : 'Sign In')}
              </button>
            </form>

            <div className="animate-element animate-delay-700 relative flex items-center justify-center my-4">
              <span className="w-full border-t border-gray-200 dark:border-gray-800"></span>
              <span className="px-4 text-sm font-medium text-gray-500 bg-gray-50 dark:bg-gray-950 absolute uppercase tracking-wider">Or continue with</span>
            </div>

            <button onClick={onGoogleSignIn} className="animate-element animate-delay-800 w-full flex items-center justify-center gap-3 border border-gray-200 dark:border-white/10 rounded-2xl py-4 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all duration-200 group shadow-sm">
                <GoogleIcon />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Continue with Google</span>
            </button>

            <p className="animate-element animate-delay-900 text-center text-base text-gray-600 dark:text-gray-400">
              {isSignUp ? "Already have an account? " : "New to our platform? "}
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); onModeChange?.(isSignUp ? 'signin' : 'signup'); }} 
                className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-bold hover:underline transition-colors ml-1"
              >
                {isSignUp ? "Sign In" : "Create Account"}
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Right column: hero image + testimonials */}
      {heroImageSrc && (
        <section className="hidden lg:block flex-1 relative p-6 bg-gray-900">
          <div className="animate-slide-right animate-delay-300 absolute inset-6 rounded-[2.5rem] bg-cover bg-center overflow-hidden shadow-2xl ring-1 ring-white/10" style={{ backgroundImage: `url(${heroImageSrc})` }}>
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
             <div className="absolute inset-0 bg-violet-500/10 mix-blend-overlay"></div>
          </div>
          
          {testimonials.length > 0 && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-6 px-8 w-full justify-center perspective-1000">
              <div className="transform translate-y-4 scale-90 opacity-80 hover:opacity-100 hover:scale-95 hover:translate-y-0 transition-all duration-500 hover:z-10">
                  <TestimonialCard testimonial={testimonials[0]} delay="animate-delay-1000" />
              </div>
              <div className="transform hover:-translate-y-4 transition-all duration-500 z-20 hover:scale-105">
                  {testimonials[1] && <TestimonialCard testimonial={testimonials[1]} delay="animate-delay-1200" />}
              </div>
              <div className="transform translate-y-4 scale-90 opacity-80 hover:opacity-100 hover:scale-95 hover:translate-y-0 transition-all duration-500 hover:z-10">
                  {testimonials[2] && <TestimonialCard testimonial={testimonials[2]} delay="animate-delay-1400" />}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
