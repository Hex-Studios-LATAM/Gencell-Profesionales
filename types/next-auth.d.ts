import "next-auth";

declare module "next-auth" {
  interface User {
    role?: "ADMIN" | "DOCTOR";
    status?: "PENDING" | "APPROVED" | "REJECTED" | "PENDING_ACTIVATION" | "ACTIVE";
  }

  interface Session {
    user: User & {
      role?: "ADMIN" | "DOCTOR";
      status?: "PENDING" | "APPROVED" | "REJECTED" | "PENDING_ACTIVATION" | "ACTIVE";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "ADMIN" | "DOCTOR";
    status?: "PENDING" | "APPROVED" | "REJECTED" | "PENDING_ACTIVATION" | "ACTIVE";
  }
}
