import { describe, it, expect } from 'vitest';
import { formatGraphql } from '../../lib/graphqlFormatter';

describe('formatGraphql', () => {
  it('returns empty output for empty input', async () => {
    const result = await formatGraphql('');
    expect(result.output).toBe('');
    expect(result.error).toBeNull();
  });

  it('returns empty output for whitespace-only input', async () => {
    const result = await formatGraphql('   \n  ');
    expect(result.output).toBe('');
    expect(result.error).toBeNull();
  });

  it('formats a simple type definition', async () => {
    const result = await formatGraphql('type User{id:ID! name:String}');
    expect(result.error).toBeNull();
    expect(result.output).toContain('type User {');
    expect(result.output).toContain('id: ID!');
    expect(result.output).toContain('name: String');
  });

  it('indents fields inside type bodies', async () => {
    const result = await formatGraphql('type Query{user:User}');
    expect(result.error).toBeNull();
    expect(result.output).toMatch(/^\s{2}user: User/m);
  });

  it('formats a query operation', async () => {
    const result = await formatGraphql('query GetUser{user(id:"1"){id name}}');
    expect(result.error).toBeNull();
    expect(result.output).toContain('query GetUser {');
    expect(result.output).toContain('user(id: "1")');
  });

  it('formats a mutation operation', async () => {
    const result = await formatGraphql(
      'mutation CreateUser($name:String!){createUser(name:$name){id}}',
    );
    expect(result.error).toBeNull();
    expect(result.output).toContain('mutation CreateUser');
    expect(result.output).toContain('$name: String!');
  });

  it('formats an interface definition', async () => {
    const result = await formatGraphql('interface Node{id:ID!}');
    expect(result.error).toBeNull();
    expect(result.output).toContain('interface Node {');
    expect(result.output).toContain('id: ID!');
  });

  it('formats an enum definition', async () => {
    const result = await formatGraphql('enum Status{ACTIVE INACTIVE PENDING}');
    expect(result.error).toBeNull();
    expect(result.output).toContain('enum Status {');
    expect(result.output).toContain('ACTIVE');
  });

  it('formats an input type', async () => {
    const result = await formatGraphql('input CreateUserInput{name:String! email:String!}');
    expect(result.error).toBeNull();
    expect(result.output).toContain('input CreateUserInput {');
    expect(result.output).toContain('name: String!');
  });

  it('formats a fragment', async () => {
    const result = await formatGraphql('fragment UserFields on User{id name email}');
    expect(result.error).toBeNull();
    expect(result.output).toContain('fragment UserFields on User {');
    expect(result.output).toContain('id');
  });

  it('formats a schema with multiple types', async () => {
    const schema = 'type Query{users:[User!]!} type User{id:ID! name:String!}';
    const result = await formatGraphql(schema);
    expect(result.error).toBeNull();
    expect(result.output).toContain('type Query {');
    expect(result.output).toContain('type User {');
  });

  it('returns error for invalid GraphQL syntax', async () => {
    const result = await formatGraphql('type {{{');
    expect(result.error).not.toBeNull();
    expect(result.output).toBe('');
  });

  it('returns error for unknown token', async () => {
    const result = await formatGraphql('@@@@not valid graphql@@@@');
    expect(result.error).not.toBeNull();
    expect(result.output).toBe('');
  });

  it('respects printWidth — wraps long field argument lists', async () => {
    const schema =
      'type Query{search(query:String! filter:String limit:Int offset:Int):SearchResult}';
    const narrow = await formatGraphql(schema, 40);
    expect(narrow.error).toBeNull();
    const lines = narrow.output.split('\n');
    expect(lines.length).toBeGreaterThan(4);
  });
});
