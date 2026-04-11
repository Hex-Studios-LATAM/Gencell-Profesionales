import "next-auth";

declare module "next-auth" {
  interface User {
    id?: string;
    role?: "ADMIN" | "DOCTOR";
    status?: "PENDING" | "APPROVED" | "REJECTED" | "PENDING_ACTIVATION" | "ACTIVE";
  }

  interface Session {
    user: User & {
      id: string;
      role?: "ADMIN" | "DOCTOR";
      status?: "PENDING" | "APPROVED" | "REJECTED" | "PENDING_ACTIVATION" | "ACTIVE";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "ADMIN" | "DOCTOR";
    status?: "PENDING" | "APPROVED" | "REJECTED" | "PENDING_ACTIVATION" | "ACTIVE";
  }
}
