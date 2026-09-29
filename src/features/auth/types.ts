/** Usuário autenticado (coleção `users` no Firestore). */
export type AppUser = {
  id: string;
  name: string;
  email: string;
};

export type SignInInput = { email: string; password: string };
export type SignUpInput = { name: string; email: string; password: string };
