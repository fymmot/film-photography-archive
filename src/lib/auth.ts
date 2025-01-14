import { persistentAtom } from '@nanostores/persistent'
import type { User } from 'netlify-identity-widget'

// Extend the Window interface to include netlifyIdentity
declare global {
  interface Window {
    netlifyIdentity: NetlifyIdentityAPI;
  }
}

// Create a persistent store for the user, using JSON serialization
export const currentUser = persistentAtom<User | null>(
  'current-user',
  null,
  {
    encode: JSON.stringify,
    decode: (str) => {
      try {
        const parsed = JSON.parse(str);
        return parsed === null ? null : parsed;
      } catch {
        return null;
      }
    }
  }
)

// Define a type for the Netlify Identity API
interface NetlifyIdentityAPI {
  on: (event: string, callback: (user: User | null) => void) => void;
  init: (options?: { autoshow: boolean }) => void;
  open: (type: 'login' | 'signup') => void;
  close: () => void;
  currentUser: () => User | null;
}

let identityPromise: Promise<NetlifyIdentityAPI> | null = null;

// Function to load the Netlify Identity widget script
function loadIdentityWidget() {
  if (typeof window === 'undefined') return Promise.reject('Not in browser')
  
  // If the widget is already loaded, use it
  if (window.netlifyIdentity) {
    const netlifyIdentity = window.netlifyIdentity;
    // Sync the current user state
    const user = netlifyIdentity.currentUser();
    currentUser.set(user);
    return Promise.resolve(netlifyIdentity);
  }
  
  if (!identityPromise) {
    identityPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://identity.netlify.com/v1/netlify-identity-widget.js'
      script.async = true
      script.onload = () => {
        // Configure the widget after loading
        const netlifyIdentity = window.netlifyIdentity;
        if (netlifyIdentity) {
          netlifyIdentity.on('init', (user: User | null) => {
            currentUser.set(user)
          })

          netlifyIdentity.on('login', (user: User | null) => {
            currentUser.set(user)
            netlifyIdentity.close()
          })

          netlifyIdentity.on('logout', () => {

            currentUser.set(null)
          })

          netlifyIdentity.init({ autoshow: false })
          
          // Sync the current user state after init
          const user = netlifyIdentity.currentUser();

          currentUser.set(user);
          
          resolve(netlifyIdentity)
        } else {
          reject('Failed to load Netlify Identity')
        }
      }
      script.onerror = () => reject('Failed to load Netlify Identity script')
      document.head.appendChild(script)
    })
  }
  
  return identityPromise
}

// Initialize auth - now just loads the widget
export const initAuth = () => {
  if (typeof window === 'undefined') return
  loadIdentityWidget().catch(console.error)
}

// Helper function to check if user is logged in
export const isLoggedIn = (user: User | null): boolean => {
  const loggedIn = user !== null;
  return loggedIn;
}

// Function to open the login modal
export const openLoginModal = async () => {
  try {
    const netlifyIdentity = await loadIdentityWidget()
    netlifyIdentity.open('login')
  } catch (error) {
    console.error('Failed to open login modal:', error)
  }
}

// Function to open the signup modal
export const openSignupModal = async () => {
  try {
    const netlifyIdentity = await loadIdentityWidget()
    netlifyIdentity.open('signup')
  } catch (error) {
    console.error('Failed to open signup modal:', error)
  }
}