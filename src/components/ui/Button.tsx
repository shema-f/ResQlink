import React from 'react';

/* =========================================================================
   resQlink shared button system — crisp, modern, Rwandan palette.
   Variants map to semantic roles so call-to-action colour never drifts
   between views: blue = primary, sun = attention, red = critical,
   green = confirmed/resolved, outline/ghost = secondary.
   ========================================================================= */

type Variant =
  | 'primary'
  | 'sun'
  | 'danger'
  | 'success'
  | 'outline'
  | 'ghost'
  | 'offline';

type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-rwblue-500 text-white hover:bg-rwblue-600 active:bg-rwblue-700 shadow-sm shadow-rwblue-500/25',
  sun: 'bg-rwsun-500 text-btn-ink hover:bg-rwsun-600 active:brightness-95 shadow-sm shadow-rwsun-500/30',
  danger:
    'bg-alert-500 text-white hover:bg-alert-600 active:bg-alert-600 shadow-sm shadow-alert-500/30',
  success:
    'bg-rwgreen-500 text-white hover:bg-rwgreen-400 active:bg-rwgreen-500 shadow-sm shadow-rwgreen-500/25',
  outline:
    'border border-ink-600 bg-panel text-ink-hd hover:bg-ink-800 active:bg-ink-700',
  ghost: 'text-slate-400 hover:bg-ink-800 hover:text-ink-hd',
  offline:
    'border border-rwsun-500/50 bg-rwsun-500/15 text-rwsun-400 hover:bg-rwsun-500/25'
};

const SIZES: Record<Size, string> = {
  sm: 'min-h-8 px-3 py-1.5 text-[11.5px] gap-1.5',
  md: 'min-h-10 px-4 py-2.5 text-xs gap-2',
  lg: 'min-h-12 px-5 py-3 text-sm gap-2'
};

const BASE =
  'inline-flex items-center justify-center rounded-xl font-bold tracking-tight transition-colors duration-150 select-none disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Stretch to the container width (mobile primary actions). */
  block?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  block = false,
  className = '',
  type = 'button',
  ...rest
}) => (
  <button
    type={type}
    className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${
      block ? 'w-full' : ''
    } ${className}`}
    {...rest}
  />
);

/** Render the same styles on an anchor (tel:, maps links…). */
export interface ButtonLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
}

export const ButtonLink: React.FC<ButtonLinkProps> = ({
  variant = 'primary',
  size = 'md',
  block = false,
  className = '',
  ...rest
}) => (
  <a
    className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${
      block ? 'w-full' : ''
    } ${className}`}
    {...rest}
  />
);

/** Square icon-only button used in toolbars and cards. */
export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  label,
  className = '',
  type = 'button',
  ...rest
}) => (
  <button
    type={type}
    aria-label={label}
    title={label}
    className={`grid h-8 w-8 place-items-center rounded-lg border border-ink-700 bg-panel text-slate-400 transition-colors hover:border-rwblue-500/50 hover:text-rwblue-600 disabled:pointer-events-none disabled:opacity-50 ${className}`}
    {...rest}
  />
);