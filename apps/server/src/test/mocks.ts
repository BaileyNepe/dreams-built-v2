import * as utils from '../utils/utils';
import { mockedClient } from './mockData';

const mockGetHost = vi.spyOn(utils, 'getHost');

const sendMailMock = vi.fn(() => Promise.resolve({ messageId: 'mocked-message-id' }));

// Mock nodemailer at module scope
vi.mock('nodemailer', () => ({
  __esModule: true, // Ensure ES module interop
  default: {
    createTransport: vi.fn(() => ({
      sendMail: sendMailMock
    }))
  }
}));

// Export sendMailMock for use in tests
export { sendMailMock };
export const setupMocks = ({ mockedHost }: { mockedHost?: string } = {}) => {
  mockGetHost.mockImplementation(() => mockedHost ?? mockedClient);

  afterEach(async () => {
    vi.resetAllMocks();
  });
};
