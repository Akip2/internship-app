import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

const handler = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        login: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if ( // TEMPORAIRE
          credentials?.login === "fontanez3u" &&
          credentials?.password === "mdp"
        ) {
          return {
            id: "1",
            login: "fontanez3u",
            firstName: "Antoine",
            lastName: "FONTANEZ"
          }
        }
        return null
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
})

export { handler as GET, handler as POST }
