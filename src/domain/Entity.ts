/**
 * EntityContact represents contact information for an entity.
 */
export class EntityContact {
  readonly type?: string;
  readonly subname?: string;
  readonly address?: string;
  readonly postalCode?: string;
  readonly city?: string;
  readonly province?: string;
  readonly country?: string;
  readonly phones: string[];
  readonly faxes: string[];
  readonly contacts: string[];

  constructor(args: {
    type?: string;
    subname?: string;
    address?: string;
    postalCode?: string;
    city?: string;
    province?: string;
    country?: string;
    phones?: string[];
    faxes?: string[];
    contacts?: string[];
  }) {
    this.type = args.type;
    this.subname = args.subname;
    this.address = args.address;
    this.postalCode = args.postalCode;
    this.city = args.city;
    this.province = args.province;
    this.country = args.country;
    this.phones = args.phones ?? [];
    this.faxes = args.faxes ?? [];
    this.contacts = args.contacts ?? [];
  }
}

/**
 * Entity represents an entity (company, person, etc.) in the BC3 document.
 */
export class Entity {
  readonly entityCode: string;
  readonly summary?: string;
  readonly name?: string;
  readonly contact?: EntityContact;
  readonly cif?: string;
  readonly web?: string;
  readonly email?: string;

  constructor(args: {
    entityCode: string;
    summary?: string;
    name?: string;
    contact?: EntityContact;
    cif?: string;
    web?: string;
    email?: string;
  }) {
    this.entityCode = args.entityCode;
    this.summary = args.summary;
    this.name = args.name;
    this.contact = args.contact;
    this.cif = args.cif;
    this.web = args.web;
    this.email = args.email;
  }
}
