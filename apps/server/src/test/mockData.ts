import { prisma } from '@config/db';
import {
  type AssessmentType,
  type AuthProvider,
  type CourseAccess,
  type FeedbackStrategy,
  type Marking,
  type QuestionOrderStrategy,
  type QuestionType,
  type ReAttemptStrategy,
  type Result,
  type Status
} from '@prisma/client';
import { type Role } from '@simplify-aviation/shared/auth';
import { type QuestionSettings } from '@simplify-aviation/shared/questions/types';
import { defaultQuestionSettings } from '@simplify-aviation/shared/questionTypes/config';
import { type UserAssessmentReturn } from '@simplify-aviation/shared/userAssessment';
import { cuid, cuid1 } from '@simplify-aviation/shared/utils/uuid';

/* -------------------------------------------------------------------------- */
/*                                MOCK CREATORS                               */
/* -------------------------------------------------------------------------- */

export const mockedClient = 'http://localhost:3333';
export const defaultUserId = 'cm36xkhjh00254amrrq30148o';


/* -------------------------------------------------------------------------- */
/*                                  CLEAN UP                                  */
/* -------------------------------------------------------------------------- */

export const cleanup = {
  // Required to remove in this order due to foreign key constraints
  contactForm: async () => {
    await prisma.contactForm.deleteMany({});
  }
};

export const cleanUpAllData = async () => {
  const cleanupFunctions = Object.values(cleanup);

  for (const cleanupFunction of cleanupFunctions) {
    await cleanupFunction();
  }
};
