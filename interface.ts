// deno-lint-ignore-file camelcase

interface User {
  description: string;
  location: string;
  url: string;
}

interface Tweet {
  id: string;
  user: User;
  id_str: string;
  full_text: string;
}
