"use client";

import { useCallback } from "react";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useSWR from "swr";
import { usePostHog } from "posthog-js/react";
import { CrownIcon } from "lucide-react";
import { Button } from "@/components/Button";
import { FormSection, FormSectionLeft } from "@/components/Form";
import { toastError, toastSuccess } from "@/components/Toast";
import { Input } from "@/components/Input";
import { LoadingContent } from "@/components/LoadingContent";
import {
  saveMultiAccountPremiumBody,
  SaveMultiAccountPremiumBody,
} from "@/app/api/user/settings/multi-account/validation";
import { updateMultiAccountPremium } from "@/utils/actions";
import { MultiAccountEmailsResponse } from "@/app/api/user/settings/multi-account/route";
import { AlertWithButton } from "@/components/Alert";
import { usePremium } from "@/components/PremiumAlert";

export function MultiAccountSection() {
  const { data, isLoading, error } = useSWR<MultiAccountEmailsResponse>(
    "/api/user/settings/multi-account",
  );
  const {
    isPremium,
    isLoading: isLoadingPremium,
    error: errorPremium,
  } = usePremium();

  return (
    <FormSection>
      <FormSectionLeft
        title="Share Premium"
        description="Share premium with other email accounts. This does not give other accounts access to read your emails. You will be billed $3 for each additional email you add."
      />

      <LoadingContent loading={isLoadingPremium} error={errorPremium}>
        {isPremium ? (
          <LoadingContent loading={isLoading} error={error}>
            {data && (
              <MultiAccountForm
                emailAddresses={data.users as { email: string }[]}
              />
            )}
          </LoadingContent>
        ) : (
          <div className="sm:col-span-2">
            <AlertWithButton
              title="Upgrade"
              description="Upgrade to premium to share premium with other email addresses."
              icon={<CrownIcon className="h-4 w-4" />}
              button={<Button link={{ href: "/premium" }}>Upgrade</Button>}
            />
          </div>
        )}
      </LoadingContent>
    </FormSection>
  );
}

function MultiAccountForm({
  emailAddresses,
}: {
  emailAddresses: { email: string }[];
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
  } = useForm<SaveMultiAccountPremiumBody>({
    resolver: zodResolver(saveMultiAccountPremiumBody),
    defaultValues: {
      emailAddresses: emailAddresses?.length ? emailAddresses : [{ email: "" }],
    },
  });

  const onSubmit: SubmitHandler<SaveMultiAccountPremiumBody> = useCallback(
    async (data) => {
      if (!data.emailAddresses) return;

      try {
        await updateMultiAccountPremium(
          data.emailAddresses.map((e) => e.email),
        );
        toastSuccess({ description: "Users updated!" });
      } catch (error) {
        toastError({
          description:
            error instanceof Error
              ? error.message
              : "There was an error updating users.",
        });
      }
    },
    [],
  );

  const { fields, append, remove } = useFieldArray({
    name: "emailAddresses",
    control,
  });
  const posthog = usePostHog();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-6 sm:col-span-full">
        {fields.map((f, i) => {
          return (
            <div key={f.id}>
              <Input
                type="text"
                name={`rules.${i}.instructions`}
                registerProps={register(`emailAddresses.${i}.email`)}
                error={errors.emailAddresses?.[i]?.email}
                onClickAdd={() => {
                  append({ email: "" });
                  posthog.capture("Clicked Add User");
                }}
                onClickRemove={
                  fields.length > 1
                    ? () => {
                        remove(i);
                        posthog.capture("Clicked Remove User");
                      }
                    : undefined
                }
              />
            </div>
          );
        })}
      </div>

      <Button type="submit" loading={isSubmitting}>
        Save
      </Button>
    </form>
  );
}
