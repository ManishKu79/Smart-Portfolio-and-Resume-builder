// src/hooks/useForm.js
import { useForm as useReactHookForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

export const useForm = (schema, defaultValues, onSubmit) => {
  const form = useReactHookForm({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const handleSubmit = async (data) => {
    try {
      await onSubmit(data)
    } catch (error) {
      toast.error(error.message || 'Something went wrong')
    }
  }

  return {
    ...form,
    onSubmit: form.handleSubmit(handleSubmit),
  }
}