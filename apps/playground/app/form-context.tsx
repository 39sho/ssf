import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import {
  ArrayField,
  BooleanField,
  EnumField,
  NumberField,
  ObjectField,
  TextField,
} from "@/auto-form";

export const { fieldContext, formContext, useFieldContext } =
  createFormHookContexts();

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    NumberField,
    BooleanField,
    EnumField,
    ObjectField,
    ArrayField,
  },
  formComponents: {},
});
