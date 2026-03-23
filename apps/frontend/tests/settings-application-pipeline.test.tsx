import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const fetchLlmConfigMock = vi.fn();
const updateLlmConfigMock = vi.fn();
const testLlmConnectionMock = vi.fn();
const fetchFeatureConfigMock = vi.fn();
const updateFeatureConfigMock = vi.fn();
const fetchApplicationsConfigMock = vi.fn();
const updateApplicationsConfigMock = vi.fn();
const fetchPromptConfigMock = vi.fn();
const updatePromptConfigMock = vi.fn();
const clearAllApiKeysMock = vi.fn();
const resetDatabaseMock = vi.fn();
const refreshStatusMock = vi.fn();
let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

class MockApplicationsConfigError extends Error {
  affectedApplications: Array<{
    application_id: string;
    company: string;
    role: string;
    status: string;
  }>;

  constructor(
    message: string,
    affectedApplications: Array<{
      application_id: string;
      company: string;
      role: string;
      status: string;
    }> = []
  ) {
    super(message);
    this.name = 'ApplicationsConfigError';
    this.affectedApplications = affectedApplications;
  }
}

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('next/image', () => ({
  default: ({ alt }: { alt?: string }) => <div data-next-image={alt ?? ''} />,
}));

vi.mock('@/lib/api/client', () => ({
  API_URL: 'http://localhost:8000',
}));

vi.mock('@/lib/context/status-cache', () => ({
  useStatusCache: () => ({
    status: {
      llm_configured: true,
      llm_healthy: true,
      has_master_resume: true,
      database_stats: {
        total_resumes: 2,
        total_jobs: 1,
        total_improvements: 3,
      },
    },
    isLoading: false,
    lastFetched: new Date('2026-03-23T10:00:00.000Z'),
    refreshStatus: refreshStatusMock,
  }),
}));

vi.mock('@/lib/context/language-context', () => ({
  useLanguage: () => ({
    contentLanguage: 'en',
    uiLanguage: 'en',
    setContentLanguage: vi.fn(),
    setUiLanguage: vi.fn(),
    languageNames: { en: 'English', pt: 'Portuguese' },
    supportedLanguages: ['en', 'pt'],
    isLoading: false,
  }),
}));

vi.mock('@/lib/i18n', () => ({
  useTranslations: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      if (key === 'settings.applicationPipeline.affectedApplicationMeta' && params) {
        return `${params.status} ${params.id}`;
      }
      return key;
    },
  }),
}));

vi.mock('@/lib/api/config', () => ({
  fetchLlmConfig: (...args: unknown[]) => fetchLlmConfigMock(...args),
  updateLlmConfig: (...args: unknown[]) => updateLlmConfigMock(...args),
  testLlmConnection: (...args: unknown[]) => testLlmConnectionMock(...args),
  fetchFeatureConfig: (...args: unknown[]) => fetchFeatureConfigMock(...args),
  updateFeatureConfig: (...args: unknown[]) => updateFeatureConfigMock(...args),
  fetchApplicationsConfig: (...args: unknown[]) => fetchApplicationsConfigMock(...args),
  updateApplicationsConfig: (...args: unknown[]) => updateApplicationsConfigMock(...args),
  ApplicationsConfigError: MockApplicationsConfigError,
  fetchPromptConfig: (...args: unknown[]) => fetchPromptConfigMock(...args),
  updatePromptConfig: (...args: unknown[]) => updatePromptConfigMock(...args),
  clearAllApiKeys: (...args: unknown[]) => clearAllApiKeysMock(...args),
  resetDatabase: (...args: unknown[]) => resetDatabaseMock(...args),
  PROVIDER_INFO: {
    openai: {
      name: 'OpenAI',
      defaultModel: 'gpt-4.1-mini',
      requiresKey: true,
    },
    anthropic: {
      name: 'Anthropic',
      defaultModel: 'claude-3-5-sonnet',
      requiresKey: true,
    },
    openrouter: {
      name: 'OpenRouter',
      defaultModel: 'openai/gpt-4.1-mini',
      requiresKey: true,
    },
    gemini: {
      name: 'Gemini',
      defaultModel: 'gemini-2.0-flash',
      requiresKey: true,
    },
    deepseek: {
      name: 'DeepSeek',
      defaultModel: 'deepseek-chat',
      requiresKey: true,
    },
    ollama: {
      name: 'Ollama',
      defaultModel: 'llama3.2',
      requiresKey: false,
    },
  },
}));

describe('Settings application pipeline', () => {
  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    fetchLlmConfigMock.mockReset();
    updateLlmConfigMock.mockReset();
    testLlmConnectionMock.mockReset();
    fetchFeatureConfigMock.mockReset();
    updateFeatureConfigMock.mockReset();
    fetchApplicationsConfigMock.mockReset();
    updateApplicationsConfigMock.mockReset();
    fetchPromptConfigMock.mockReset();
    updatePromptConfigMock.mockReset();
    clearAllApiKeysMock.mockReset();
    resetDatabaseMock.mockReset();
    refreshStatusMock.mockReset();

    fetchLlmConfigMock.mockResolvedValue({
      provider: 'openai',
      model: 'gpt-4.1-mini',
      api_key: '***',
      api_base: '',
    });
    fetchFeatureConfigMock.mockResolvedValue({
      enable_cover_letter: false,
      enable_outreach_message: false,
    });
    fetchApplicationsConfigMock.mockResolvedValue({
      statuses: ['Applied', 'Interview'],
    });
    fetchPromptConfigMock.mockResolvedValue({
      prompt_options: [],
      default_prompt_id: 'keywords',
    });
    updateApplicationsConfigMock.mockResolvedValue({
      statuses: ['Offer', 'Interview'],
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('loads current statuses and saves local add, reorder, and remove edits', async () => {
    const { default: SettingsPage } = await import('@/app/(default)/settings/page');
    render(<SettingsPage />);

    expect(await screen.findByText('settings.applicationPipeline.title')).toBeInTheDocument();
    expect(screen.getByText('Applied')).toBeInTheDocument();
    expect(screen.getByText('Interview')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('settings.applicationPipeline.newStatusLabel'), {
      target: { value: 'Offer' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'settings.applicationPipeline.addAction' }));

    expect(screen.getByText('Offer')).toBeInTheDocument();

    fireEvent.click(
      screen.getAllByRole('button', { name: 'settings.applicationPipeline.moveUpAction' })[2]!
    );
    fireEvent.click(
      screen.getAllByRole('button', { name: 'settings.applicationPipeline.removeAction' })[0]!
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'settings.applicationPipeline.saveAction' })
    );

    await waitFor(() => {
      expect(updateApplicationsConfigMock).toHaveBeenCalledWith({
        statuses: ['Offer', 'Interview'],
      });
    });
  });

  it('shows the affected applications when pipeline removal is rejected by the backend', async () => {
    updateApplicationsConfigMock.mockRejectedValue(
      new MockApplicationsConfigError('Cannot remove application statuses that are still in use.', [
        {
          application_id: 'application-1',
          company: 'Acme',
          role: 'Engineer',
          status: 'Applied',
        },
      ])
    );

    const { default: SettingsPage } = await import('@/app/(default)/settings/page');
    render(<SettingsPage />);

    await screen.findByText('settings.applicationPipeline.title');

    fireEvent.click(
      screen.getAllByRole('button', { name: 'settings.applicationPipeline.removeAction' })[0]!
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'settings.applicationPipeline.saveAction' })
    );

    expect(
      await screen.findByText('Cannot remove application statuses that are still in use.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('settings.applicationPipeline.affectedApplicationsTitle')
    ).toBeInTheDocument();
    expect(screen.getByText('Acme / Engineer')).toBeInTheDocument();
    expect(screen.getByText('Applied application-1')).toBeInTheDocument();
  });
});
