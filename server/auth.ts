import { authenticateSupabase } from "./auth-routes";

// Re-export the auth middleware for backward compatibility
export { authenticateSupabase as authenticateUser };

// Credit check middleware factory
export function checkCredits(creditType: 'resume' | 'interview' | 'linkedin') {
  return async (req: any, res: any, next: any) => {
    try {
      const token = req.supabaseToken;
      if (!token) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // For now, pass through - credit checking will be implemented in routes with database access
      next();
    } catch (error) {
      return res.status(500).json({ error: "Credit check failed" });
    }
  };
}
