'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState, type ReactNode } from 'react';
import { useForm, useWatch, type UseFormRegisterReturn } from 'react-hook-form';
import { Alert, AlertDescription, AlertTitle } from '../../primitives/alert';
import { Button } from '../../primitives/button';
import { RATE_LIMITED } from '../auth/messages';
import { FIELD_MESSAGES } from '../form/field-errors';
import { FormField } from '../form/form-field';
import { slugify } from '../form/slugify';
import {
  AccountAndOrgFields,
  ORG_FIELD_MESSAGES,
  OrgFields,
  type RegisterOrgValues,
} from './register-org-form.schema';

export type SlugStatus = 'idle' | 'checking' | 'available' | 'taken';

type RegisterOrgFormProps = {
  mode: 'signed_out' | 'signed_in';
  appOrigin: string;
  onSubmit: (values: RegisterOrgValues) => void;
  onSlugBlur?: (slug: string) => void;
  slugStatus?: SlugStatus;
  signInHref: string;
  pending?: boolean;
  error?: 'email_taken' | 'rate_limited';
};

type OrgSectionProps = {
  nameField: UseFormRegisterReturn;
  slugField: UseFormRegisterReturn;
  slug: string;
  appOrigin: string;
  slugStatus: SlugStatus;
  nameError?: string;
  slugError?: string;
  pending: boolean;
};

function OrgSection({
  nameField,
  slugField,
  slug,
  appOrigin,
  slugStatus,
  nameError,
  slugError,
  pending,
}: OrgSectionProps) {
  const host = appOrigin.replace(/^https?:\/\//, '');
  const hint: ReactNode = (
    <>
      Your public page: <span className="text-foreground">{`${host}/o/${slug || 'your-org'}`}</span>
      {slugStatus === 'checking' ? ' · Checking…' : null}
      {slugStatus === 'available' ? <span className="text-emerald-300"> · Available</span> : null}
    </>
  );
  return (
    <fieldset className="grid gap-4">
      <legend className="mb-1 text-sm font-semibold">Your organization</legend>
      <FormField
        id="org-name"
        label="Organization name"
        placeholder="Uni Esports Club"
        {...nameField}
        error={nameError}
        disabled={pending}
      />
      <FormField
        id="org-slug"
        label="Address"
        autoCapitalize="none"
        spellCheck={false}
        {...slugField}
        hint={hint}
        error={slugError ?? (slugStatus === 'taken' ? 'That address is taken.' : undefined)}
        disabled={pending}
      />
    </fieldset>
  );
}

function SignedInForm({
  appOrigin,
  onSubmit,
  onSlugBlur,
  slugStatus = 'idle',
  pending = false,
  error,
}: RegisterOrgFormProps) {
  const [slugEdited, setSlugEdited] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<OrgFields>({
    resolver: zodResolver(OrgFields),
    mode: 'onTouched',
    defaultValues: { orgName: '', slug: '' },
  });
  const slug = useWatch({ control, name: 'slug' });
  const taken = slugStatus === 'taken';

  return (
    <form
      className="grid gap-6"
      noValidate
      onSubmit={handleSubmit((values) => {
        if (!taken) onSubmit({ org: { name: values.orgName, slug: values.slug }, account: null });
      })}
    >
      {error === 'rate_limited' ? (
        <Alert variant="destructive">
          <AlertTitle>{RATE_LIMITED.title}</AlertTitle>
          <AlertDescription>{RATE_LIMITED.description}</AlertDescription>
        </Alert>
      ) : null}
      <OrgSection
        nameField={register('orgName', {
          onChange: (e: { target: { value: string } }) => {
            if (!slugEdited) setValue('slug', slugify(e.target.value));
          },
        })}
        slugField={register('slug', {
          onChange: () => setSlugEdited(true),
          onBlur: (e: { target: { value: string } }) => {
            const parsed = OrgFields.shape.slug.safeParse(e.target.value);
            if (parsed.success) onSlugBlur?.(parsed.data);
          },
        })}
        slug={slug}
        appOrigin={appOrigin}
        slugStatus={slugStatus}
        nameError={errors.orgName ? ORG_FIELD_MESSAGES.orgName : undefined}
        slugError={errors.slug ? ORG_FIELD_MESSAGES.slug : undefined}
        pending={pending}
      />
      <Button type="submit" className="w-full" disabled={pending || taken}>
        {pending ? 'Registering…' : 'Register organization'}
      </Button>
    </form>
  );
}

function SignedOutForm({
  appOrigin,
  onSubmit,
  onSlugBlur,
  slugStatus = 'idle',
  signInHref,
  pending = false,
  error,
}: RegisterOrgFormProps) {
  const [slugEdited, setSlugEdited] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<AccountAndOrgFields>({
    resolver: zodResolver(AccountAndOrgFields),
    mode: 'onTouched',
    defaultValues: { displayName: '', email: '', password: '', orgName: '', slug: '' },
  });
  const slug = useWatch({ control, name: 'slug' });
  const taken = slugStatus === 'taken';

  return (
    <form
      className="grid gap-6"
      noValidate
      onSubmit={handleSubmit((values) => {
        if (taken) return;
        onSubmit({
          org: { name: values.orgName, slug: values.slug },
          account: {
            displayName: values.displayName,
            email: values.email,
            password: values.password,
          },
        });
      })}
    >
      {error === 'rate_limited' ? (
        <Alert variant="destructive">
          <AlertTitle>{RATE_LIMITED.title}</AlertTitle>
          <AlertDescription>{RATE_LIMITED.description}</AlertDescription>
        </Alert>
      ) : null}

      <fieldset className="grid gap-4">
        <legend className="mb-1 text-sm font-semibold">Your account</legend>
        <FormField
          id="org-owner-name"
          label="Your display name"
          autoComplete="nickname"
          {...register('displayName')}
          error={errors.displayName ? FIELD_MESSAGES.displayName : undefined}
          disabled={pending}
        />
        <FormField
          id="org-owner-email"
          type="email"
          label="Email"
          autoComplete="email"
          {...register('email')}
          error={
            errors.email ? (
              FIELD_MESSAGES.email
            ) : error === 'email_taken' ? (
              <>
                This email already has an account.{' '}
                <a href={signInHref} className="underline underline-offset-4">
                  Sign in
                </a>{' '}
                and register the organization from there.
              </>
            ) : undefined
          }
          disabled={pending}
        />
        <FormField
          id="org-owner-password"
          type="password"
          label="Password"
          autoComplete="new-password"
          hint="At least 10 characters. A few words work well."
          {...register('password')}
          error={errors.password ? FIELD_MESSAGES.password : undefined}
          disabled={pending}
        />
      </fieldset>

      <OrgSection
        nameField={register('orgName', {
          onChange: (e: { target: { value: string } }) => {
            if (!slugEdited) setValue('slug', slugify(e.target.value));
          },
        })}
        slugField={register('slug', {
          onChange: () => setSlugEdited(true),
          onBlur: (e: { target: { value: string } }) => {
            const parsed = OrgFields.shape.slug.safeParse(e.target.value);
            if (parsed.success) onSlugBlur?.(parsed.data);
          },
        })}
        slug={slug}
        appOrigin={appOrigin}
        slugStatus={slugStatus}
        nameError={errors.orgName ? ORG_FIELD_MESSAGES.orgName : undefined}
        slugError={errors.slug ? ORG_FIELD_MESSAGES.slug : undefined}
        pending={pending}
      />

      <div className="grid gap-2">
        <Button type="submit" className="w-full" disabled={pending || taken}>
          {pending ? 'Creating…' : 'Create account and organization'}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          We'll email you a link to verify your address before you can manage the organization.
        </p>
      </div>
    </form>
  );
}

export function RegisterOrgForm(props: RegisterOrgFormProps) {
  return props.mode === 'signed_out' ? <SignedOutForm {...props} /> : <SignedInForm {...props} />;
}
