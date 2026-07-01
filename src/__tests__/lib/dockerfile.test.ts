import { describe, it, expect } from 'vitest';
import { processDockerfile } from '../../lib/dockerfile';

describe('processDockerfile — formatting', () => {
  it('returns empty output for empty input', () => {
    const r = processDockerfile('');
    expect(r.output).toBe('');
    expect(r.issues).toHaveLength(0);
    expect(r.error).toBeNull();
  });

  it('returns empty output for whitespace-only input', () => {
    const r = processDockerfile('   \n  ');
    expect(r.output).toBe('');
    expect(r.error).toBeNull();
  });

  it('uppercases the FROM keyword', () => {
    const r = processDockerfile('from ubuntu:20.04');
    expect(r.error).toBeNull();
    expect(r.output).toBe('FROM ubuntu:20.04');
  });

  it('uppercases any instruction keyword', () => {
    const r = processDockerfile('run echo hello');
    expect(r.output).toContain('RUN echo hello');
  });

  it('strips trailing whitespace from lines', () => {
    const r = processDockerfile('FROM ubuntu:20.04   ');
    expect(r.output).toBe('FROM ubuntu:20.04');
  });

  it('collapses multiple blank lines to one', () => {
    const r = processDockerfile('FROM ubuntu:20.04\n\n\n\nRUN echo hi');
    expect(r.output).not.toMatch(/\n{3,}/);
    expect(r.output).toContain('\n\nRUN');
  });

  it('preserves comments unchanged', () => {
    const r = processDockerfile('# build stage\nFROM ubuntu:20.04');
    expect(r.output).toContain('# build stage');
  });

  it('preserves continuation lines in multi-line RUN', () => {
    const input = 'FROM ubuntu:20.04\nRUN apt-get update && \\\n    apt-get install -y curl';
    const r = processDockerfile(input);
    expect(r.output).toContain('RUN apt-get update && \\');
    expect(r.output).toContain('    apt-get install -y curl');
  });

  it('preserves indentation in continuation lines', () => {
    const input = 'FROM node:18\nrun npm install \\\n    --production';
    const r = processDockerfile(input);
    expect(r.output).toContain('RUN npm install \\');
    expect(r.output).toContain('    --production');
  });
});

describe('processDockerfile — linting', () => {
  it('warns DL3006 when FROM uses :latest tag', () => {
    const r = processDockerfile('FROM ubuntu:latest');
    const issue = r.issues.find(i => i.code === 'DL3006');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('warning');
  });

  it('warns DL3006 when FROM has no tag', () => {
    const r = processDockerfile('FROM ubuntu');
    const issue = r.issues.find(i => i.code === 'DL3006');
    expect(issue).toBeDefined();
  });

  it('does not warn DL3006 when FROM has a specific tag', () => {
    const r = processDockerfile('FROM ubuntu:22.04\nUSER nobody');
    expect(r.issues.find(i => i.code === 'DL3006')).toBeUndefined();
  });

  it('does not warn DL3006 for FROM scratch', () => {
    const r = processDockerfile('FROM scratch\nCOPY bin /bin');
    expect(r.issues.find(i => i.code === 'DL3006')).toBeUndefined();
  });

  it('does not warn DL3006 when digest is used', () => {
    const r = processDockerfile('FROM ubuntu@sha256:abc123\nUSER nobody');
    expect(r.issues.find(i => i.code === 'DL3006')).toBeUndefined();
  });

  it('handles FROM with --platform flag correctly', () => {
    const r = processDockerfile('FROM --platform=linux/amd64 ubuntu:22.04\nUSER nobody');
    expect(r.issues.find(i => i.code === 'DL3006')).toBeUndefined();
  });

  it('handles multi-stage FROM with AS alias', () => {
    const r = processDockerfile('FROM node:18 AS builder\nUSER nobody');
    expect(r.issues.find(i => i.code === 'DL3006')).toBeUndefined();
  });

  it('errors DL4000 for deprecated MAINTAINER', () => {
    const r = processDockerfile('FROM ubuntu:20.04\nMAINTAINER dev@example.com');
    const issue = r.issues.find(i => i.code === 'DL4000');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('error');
  });

  it('warns DL3020 for ADD instruction', () => {
    const r = processDockerfile('FROM ubuntu:20.04\nADD . /app');
    const issue = r.issues.find(i => i.code === 'DL3020');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('warning');
  });

  it('warns DL3000 for relative WORKDIR', () => {
    const r = processDockerfile('FROM ubuntu:20.04\nWORKDIR app');
    const issue = r.issues.find(i => i.code === 'DL3000');
    expect(issue).toBeDefined();
  });

  it('does not warn DL3000 for absolute WORKDIR', () => {
    const r = processDockerfile('FROM ubuntu:20.04\nWORKDIR /app');
    expect(r.issues.find(i => i.code === 'DL3000')).toBeUndefined();
  });

  it('does not warn DL3000 for WORKDIR using $variable', () => {
    const r = processDockerfile('FROM ubuntu:20.04\nWORKDIR $APP_DIR');
    expect(r.issues.find(i => i.code === 'DL3000')).toBeUndefined();
  });

  it('warns DL3025 for CMD in shell form', () => {
    const r = processDockerfile('FROM ubuntu:20.04\nCMD node server.js');
    const issue = r.issues.find(i => i.code === 'DL3025');
    expect(issue).toBeDefined();
  });

  it('does not warn DL3025 for CMD in JSON form', () => {
    const r = processDockerfile('FROM ubuntu:20.04\nCMD ["node", "server.js"]');
    expect(r.issues.find(i => i.code === 'DL3025')).toBeUndefined();
  });

  it('warns DL3025 for ENTRYPOINT in shell form', () => {
    const r = processDockerfile('FROM ubuntu:20.04\nENTRYPOINT /start.sh');
    expect(r.issues.find(i => i.code === 'DL3025')).toBeDefined();
  });

  it('does not warn DL3025 for ENTRYPOINT in JSON form', () => {
    const r = processDockerfile('FROM ubuntu:20.04\nENTRYPOINT ["/start.sh"]');
    expect(r.issues.find(i => i.code === 'DL3025')).toBeUndefined();
  });

  it('warns DL3015 for apt-get install without -y', () => {
    const r = processDockerfile('FROM ubuntu:20.04\nRUN apt-get install curl');
    expect(r.issues.find(i => i.code === 'DL3015')).toBeDefined();
  });

  it('does not warn DL3015 when -y is present', () => {
    const r = processDockerfile(
      'FROM ubuntu:20.04\nRUN apt-get install -y curl && rm -rf /var/lib/apt/lists/*',
    );
    expect(r.issues.find(i => i.code === 'DL3015')).toBeUndefined();
  });

  it('warns DL3009 for standalone apt-get update', () => {
    const r = processDockerfile('FROM ubuntu:20.04\nRUN apt-get update');
    expect(r.issues.find(i => i.code === 'DL3009')).toBeDefined();
  });

  it('warns DL3028 for apt-get install without list cleanup', () => {
    const r = processDockerfile('FROM ubuntu:20.04\nRUN apt-get install -y curl');
    expect(r.issues.find(i => i.code === 'DL3028')).toBeDefined();
  });

  it('does not warn DL3028 when list cleanup is present', () => {
    const r = processDockerfile(
      'FROM ubuntu:20.04\nRUN apt-get install -y curl && rm -rf /var/lib/apt/lists/*',
    );
    expect(r.issues.find(i => i.code === 'DL3028')).toBeUndefined();
  });

  it('warns DL3002 for USER root', () => {
    const r = processDockerfile('FROM ubuntu:20.04\nUSER root');
    expect(r.issues.find(i => i.code === 'DL3002' && i.severity === 'warning')).toBeDefined();
  });

  it('notes DL3002 info when no USER instruction is present', () => {
    const r = processDockerfile('FROM ubuntu:20.04\nRUN echo hi');
    expect(r.issues.find(i => i.code === 'DL3002' && i.severity === 'info')).toBeDefined();
  });

  it('attaches correct line numbers to issues', () => {
    const r = processDockerfile('FROM ubuntu:20.04\nMAINTAINER dev@example.com');
    const issue = r.issues.find(i => i.code === 'DL4000');
    expect(issue?.line).toBe(2);
  });

  it('produces no errors or warnings for a well-formed Dockerfile', () => {
    const dockerfile = [
      'FROM node:18-alpine',
      'WORKDIR /app',
      'COPY package*.json ./',
      'RUN npm ci --only=production',
      'COPY . .',
      'USER node',
      'CMD ["node", "server.js"]',
    ].join('\n');
    const r = processDockerfile(dockerfile);
    const significant = r.issues.filter(i => i.severity !== 'info');
    expect(significant).toHaveLength(0);
  });
});
