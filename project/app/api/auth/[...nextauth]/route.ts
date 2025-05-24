import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { JWT } from "next-auth/jwt";

interface CustomToken extends JWT {
  role?: string;
  id?: string;
}

interface RedirectParams {
  url: string;
  baseUrl: string;
  token?: CustomToken;
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email et mot de passe requis');
        }

        try {
          const { db } = await connectToDatabase();

          // Vérifier dans la collection citizens
          const citizen = await db.collection('citizens').findOne({ email: credentials.email });
          if (citizen) {
            const isPasswordValid = await bcrypt.compare(credentials.password, citizen.password);
            if (isPasswordValid) {
              return {
                id: citizen._id.toString(),
                email: citizen.email,
                name: `${citizen.prenom} ${citizen.nom}`,
                role: 'citizen'
              };
            }
          }

          // Vérifier dans la collection agents
          const agent = await db.collection('agents').findOne({ email: credentials.email });
          if (agent) {
            const isPasswordValid = await bcrypt.compare(credentials.password, agent.password);
            if (isPasswordValid) {
              return {
                id: agent._id.toString(),
                email: agent.email,
                name: agent.name,
                role: 'agent'
              };
            }
          }

          // Vérifier dans la collection users (admins)
          const admin = await db.collection('users').findOne({ email: credentials.email });
          if (admin) {
            const isPasswordValid = await bcrypt.compare(credentials.password, admin.password);
            if (isPasswordValid) {
              return {
                id: admin._id.toString(),
                email: admin.email,
                name: admin.name,
                role: 'admin'
              };
            }
          }

          throw new Error('Email ou mot de passe incorrect');
        } catch (error) {
          console.error('Erreur lors de l\'authentification:', error);
          throw new Error('Erreur lors de l\'authentification');
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
    async redirect({ url, baseUrl, token }: RedirectParams) {
      // Rediriger directement vers le dashboard approprié après l'authentification
      if (url.includes('/auth/login') || url === baseUrl) {
        const role = token?.role;
        if (role === 'admin') {
          return `${baseUrl}/admin/dashboard`;
        } else if (role === 'agent') {
          return `${baseUrl}/agent/dashboard`;
        } else if (role === 'citizen') {
          return `${baseUrl}/citizen/dashboard`;
        }
      }

      // Si l'URL est relative, ajouter le baseUrl
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      // Si l'URL est absolue et sur le même domaine, la laisser telle quelle
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      // Sinon, rediriger vers la page de connexion
      return baseUrl;
    }
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Active les logs de débogage de NextAuth
});

export { handler as GET, handler as POST }; 