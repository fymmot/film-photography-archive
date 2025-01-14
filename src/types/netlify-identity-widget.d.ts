declare module 'netlify-identity-widget' {
  export interface User {
    id: string;
    email: string;
    app_metadata: {
      provider?: string;
      roles?: string[];
    };
    user_metadata: Record<string, unknown>;
    created_at: string;
    confirmed_at: string;
    email_confirmed: boolean;
    token: {
      access_token: string;
      token_type: string;
      expires_in: number;
      refresh_token: string;
      expires_at: number;
    };
  }

  export interface GoTrueInit {
    APIUrl: string;
    setCookie: boolean;
  }

  export interface Settings {
    autoshow: boolean;
    locale: string;
  }

  export interface Widget {
    init: (opts?: Partial<Settings>) => void;
    open: (cb?: () => void) => void;
    close: () => void;
    logout: () => void;
    refresh: (force?: boolean) => void;
    on: (event: string, cb: (user: User | null) => void) => void;
    off: (event: string) => void;
    currentUser: () => User | null;
  }

  const widget: Widget;
  export default widget;
} 