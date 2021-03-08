// todo the database would have something like this

export interface User {
    id: string;
    username: string;
    email: string;
  }
  
  const users: Array<User> = [
    {
      id: "ad9c8910-83ad-4256-b648-62642ebba229",
      username: "Arun",
      email: "arun@woosaree.xyz"
    },
    {
      id: "829c4034-663b-4ded-8cf1-beb9e3f5e841",
      username: "max",
      email: "max@example.com"
    },
  ]
  
  export default users;