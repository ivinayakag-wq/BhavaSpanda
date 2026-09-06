"use client";

import { createContext, useContext, useEffect, useState, useMemo, useCallback, type ReactNode } from "react";
import { createClient } from "@/lib/supabase-client";
import type { User, SupabaseClient } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  supabase: SupabaseClient | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  supabase: null,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (event === "SIGNED_IN" && currentUser) {
          try {
            await fetch("/api/auth/on-signin", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: currentUser.id,
                phone: currentUser.phone,
                email: currentUser.email,
              }),
            });
          } catch {
            // Profile may already exist — non-critical
          }
        }
      },
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signOut = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  }, [supabase]);

  const value = useMemo(
    () => ({ user, loading: !supabase ? false : loading, supabase, signOut }),
    [user, loading, supabase, signOut],
  );

  return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
