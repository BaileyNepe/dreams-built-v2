import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Mail, MapPin, Send, Smartphone } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '#/components/ui/form'
import { cn } from '#/lib/utils'
import { site } from '#/lib/site'
import { Socials } from './Socials'

const MAX_MESSAGE_LENGTH = 2000

const ContactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is too short')
    .max(50, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().optional(),
  message: z
    .string()
    .min(5, 'Message should be at least 5 characters long')
    .max(MAX_MESSAGE_LENGTH, `Message is too long (max ${MAX_MESSAGE_LENGTH})`),
})

type ContactFormValues = z.infer<typeof ContactSchema>

export function ContactSection() {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(ContactSchema),
    defaultValues: { name: '', email: '', phoneNumber: '', message: '' },
  })

  const messageValue = form.watch('message') ?? ''
  const messageLength = messageValue.length
  const progressValue = (messageLength / MAX_MESSAGE_LENGTH) * 100
  const isNearLimit = messageLength >= MAX_MESSAGE_LENGTH * 0.85
  const isOverLimit = messageLength > MAX_MESSAGE_LENGTH

  const onSubmit = form.handleSubmit(async (values) => {
    const send = async () => {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          message?: string
        }
        throw new Error(data.message ?? 'Failed to send message')
      }
      form.reset()
    }

    toast.promise(send(), {
      loading: 'Sending message...',
      success: 'Message sent successfully',
      error: (err: Error) => `Failed to send message: ${err.message}`,
    })
  })

  return (
    <div className="mx-4 grid w-full max-w-5xl gap-8 rounded-2xl bg-card p-6 shadow-lg md:mx-0 md:grid-cols-[0.6fr_1fr] md:p-10">
      <div className="space-y-6">
        <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Contact Us
        </h2>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-semibold">Email</span>
            </div>
            <a
              href={`mailto:${site.email}`}
              className="block pl-7 text-sm text-muted-foreground hover:text-foreground"
            >
              {site.email}
            </a>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-semibold">Phone</span>
            </div>
            <p className="pl-7 text-sm text-muted-foreground">{site.phone}</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-semibold">Address</span>
            </div>
            <p className="pl-7 text-sm text-muted-foreground">{site.address}</p>
          </div>
        </div>

        <div className="my-6 h-px w-full border-t border-dashed border-border md:hidden" />

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider">
            Follow Us
          </p>
          <Socials />
        </div>
      </div>

      <div className="md:border-l md:border-dashed md:border-border md:pl-10">
        <div className="hidden md:block md:border-t md:border-dashed md:border-border md:pt-0" />

        <div className="space-y-2">
          <h3 className="text-2xl font-bold">Drop Us A Line</h3>
          <p className="text-xs text-muted-foreground">
            We would love to hear from you! Please fill out the form below and
            we will get back to you as soon as possible.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={onSubmit} className="mt-6 space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" autoComplete="name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="021 xxx xxxx"
                      autoComplete="tel"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={8}
                      placeholder="Tell us about your project..."
                      maxLength={MAX_MESSAGE_LENGTH}
                      {...field}
                    />
                  </FormControl>
                  <div className="mt-1 flex flex-col gap-1">
                    <div
                      aria-hidden
                      className="h-1 w-full overflow-hidden rounded-full bg-muted"
                    >
                      <div
                        className={cn(
                          'h-full transition-all',
                          isOverLimit
                            ? 'bg-destructive'
                            : isNearLimit
                              ? 'bg-amber-500'
                              : 'bg-primary',
                        )}
                        style={{
                          width: `${Math.min(progressValue, 100)}%`,
                        }}
                      />
                    </div>
                    <p
                      className={cn(
                        'self-end text-[0.7rem]',
                        isOverLimit
                          ? 'text-destructive'
                          : isNearLimit
                            ? 'text-amber-600'
                            : 'text-muted-foreground',
                      )}
                    >
                      {messageLength}/{MAX_MESSAGE_LENGTH} characters
                    </p>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              size="lg"
              variant="accent"
              disabled={form.formState.isSubmitting}
              className="w-full sm:w-auto"
            >
              <Send className="h-4 w-4" />
              {form.formState.isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
