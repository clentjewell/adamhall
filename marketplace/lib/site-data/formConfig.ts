/* ------------------------------------------------------------------
   Valuation / contact form field configuration.

   Ported from the reference site. The reference posted to a Forminator
   endpoint (VITE_FORM_ENDPOINT); in the marketplace the forms submit to
   real server actions instead, so no endpoint constant is needed here.
   Only the field definitions (order, labels, placeholders, options) are
   kept, so the ported forms look identical to the reference.
   ------------------------------------------------------------------ */

export interface FieldDef {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'select' | 'textarea';
  placeholder?: string;
  required?: boolean;
  options?: string[];
  autoComplete?: string;
}

/* Field order, labels, placeholders and options match the reference form exactly. */
export const valuationFields: FieldDef[] = [
  {
    name: 'car',
    label: 'Car Make, Model & Year',
    type: 'text',
    placeholder: 'E.g. Hyundai i30 2018',
    required: true,
  },
  {
    name: 'condition',
    label: 'Car Condition',
    type: 'select',
    required: true,
    options: ['Select One', 'Excellent', 'Very good', 'Good', 'Fair'],
  },
  {
    name: 'kilometres',
    label: 'Kilometres travelled',
    type: 'text',
    placeholder: 'E.g. 10,000',
    required: true,
    autoComplete: 'off',
  },
  {
    name: 'location',
    label: 'Car Location',
    type: 'text',
    placeholder: 'E.g. Surfers Paradise',
    required: true,
  },
  {
    name: 'name',
    label: 'Your Name',
    type: 'text',
    placeholder: 'E.g. John Smith',
    required: true,
    autoComplete: 'name',
  },
  {
    name: 'phone',
    label: 'Your Phone Number',
    type: 'tel',
    placeholder: 'E.g. 0412 345 678',
    required: true,
    autoComplete: 'tel',
  },
  {
    name: 'email',
    label: 'Your Email',
    type: 'email',
    placeholder: 'E.g. john@smith.com',
    required: true,
    autoComplete: 'email',
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
    placeholder: "Anything else that's noteworthy?",
    required: false,
  },
];
