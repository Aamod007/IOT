import { createContext, useContext, useReducer, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { User, AuthState } from '@/lib/types';
import { authApi } from '@/lib/api';

interface DecodedToken {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  exp: number;
}

type AuthAction =
  | { type: 'AUTH_REQUEST' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' };

type AuthContextType = {
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuthTimeout: (expirationTime: number) => void;
};

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_REQUEST':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, dispatch] = useReducer(authReducer, initialState, () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp < currentTime) {
          localStorage.removeItem('token');
          return initialState;
        }
        
        const user: User = {
          id: decodedToken.id,
          name: decodedToken.name,
          email: decodedToken.email,
          isAdmin: decodedToken.isAdmin,
        };
        
        return {
          ...initialState,
          user,
          token,
          isAuthenticated: true,
        };
      } catch (error) {
        localStorage.removeItem('token');
        return initialState;
      }
    }
    return initialState;
  });

  const login = async (email: string, password: string) => {
    dispatch({ type: 'AUTH_REQUEST' });
    try {
      const response = await authApi.login(email, password);
      const { token } = response.data;
      const decodedToken = jwtDecode<DecodedToken>(token);
      
      const user: User = {
        id: decodedToken.id,
        name: decodedToken.name,
        email: decodedToken.email,
        isAdmin: decodedToken.isAdmin,
      };
      
      localStorage.setItem('token', token);
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
      
      // Set auto-logout when token expires
      const expirationTime = decodedToken.exp * 1000 - Date.now();
      checkAuthTimeout(expirationTime);
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: 'Invalid email or password' });
    }
  };

  const register = async (name: string, email: string, password: string) => {
    dispatch({ type: 'AUTH_REQUEST' });
    try {
      const response = await authApi.register(name, email, password);
      const { token } = response.data;
      const decodedToken = jwtDecode<DecodedToken>(token);
      
      const user: User = {
        id: decodedToken.id,
        name: decodedToken.name,
        email: decodedToken.email,
        isAdmin: decodedToken.isAdmin,
      };
      
      localStorage.setItem('token', token);
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
      
      // Set auto-logout when token expires
      const expirationTime = decodedToken.exp * 1000 - Date.now();
      checkAuthTimeout(expirationTime);
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: 'Registration failed. Email may already be in use.' });
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  const checkAuthTimeout = (expirationTime: number) => {
    setTimeout(() => {
      logout();
    }, expirationTime);
  };

  // Verify token validity on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp < currentTime) {
          logout();
        } else {
          // Set auto-logout when token expires
          const expirationTime = decodedToken.exp * 1000 - Date.now();
          checkAuthTimeout(expirationTime);
        }
      } catch (error) {
        logout();
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authState,
        login,
        register,
        logout,
        checkAuthTimeout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};