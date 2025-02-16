declare module 'astro:content' {
	interface Render {
		'.mdx': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	interface Render {
		'.md': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	export { z } from 'astro/zod';

	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

	// This needs to be in sync with ImageMetadata
	export type ImageFunction = () => import('astro/zod').ZodObject<{
		src: import('astro/zod').ZodString;
		width: import('astro/zod').ZodNumber;
		height: import('astro/zod').ZodNumber;
		format: import('astro/zod').ZodUnion<
			[
				import('astro/zod').ZodLiteral<'png'>,
				import('astro/zod').ZodLiteral<'jpg'>,
				import('astro/zod').ZodLiteral<'jpeg'>,
				import('astro/zod').ZodLiteral<'tiff'>,
				import('astro/zod').ZodLiteral<'webp'>,
				import('astro/zod').ZodLiteral<'gif'>,
				import('astro/zod').ZodLiteral<'svg'>,
				import('astro/zod').ZodLiteral<'avif'>,
			]
		>;
	}>;

	type BaseSchemaWithoutEffects =
		| import('astro/zod').AnyZodObject
		| import('astro/zod').ZodUnion<[BaseSchemaWithoutEffects, ...BaseSchemaWithoutEffects[]]>
		| import('astro/zod').ZodDiscriminatedUnion<string, import('astro/zod').AnyZodObject[]>
		| import('astro/zod').ZodIntersection<BaseSchemaWithoutEffects, BaseSchemaWithoutEffects>;

	type BaseSchema =
		| BaseSchemaWithoutEffects
		| import('astro/zod').ZodEffects<BaseSchemaWithoutEffects>;

	export type SchemaContext = { image: ImageFunction };

	type DataCollectionConfig<S extends BaseSchema> = {
		type: 'data';
		schema?: S | ((context: SchemaContext) => S);
	};

	type ContentCollectionConfig<S extends BaseSchema> = {
		type?: 'content';
		schema?: S | ((context: SchemaContext) => S);
	};

	type CollectionConfig<S> = ContentCollectionConfig<S> | DataCollectionConfig<S>;

	export function defineCollection<S extends BaseSchema>(
		input: CollectionConfig<S>
	): CollectionConfig<S>;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[]
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[]
	): Promise<CollectionEntry<C>[]>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
			  }
			: {
					collection: C;
					id: keyof DataEntryMap[C];
			  }
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"docs": {
"404.mdx": {
	id: "404.mdx";
  slug: "404";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ExamTemplate.md": {
	id: "ExamTemplate.md";
  slug: "examtemplate";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"azure/AI-102.md": {
	id: "azure/AI-102.md";
  slug: "azure/ai-102";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"azure/AI-900.md": {
	id: "azure/AI-900.md";
  slug: "azure/ai-900";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"azure/AZ-104.md": {
	id: "azure/AZ-104.md";
  slug: "azure/az-104";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"azure/AZ-120.md": {
	id: "azure/AZ-120.md";
  slug: "azure/az-120";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"azure/AZ-140.md": {
	id: "azure/AZ-140.md";
  slug: "azure/az-140";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"azure/AZ-204.md": {
	id: "azure/AZ-204.md";
  slug: "azure/az-204";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"azure/AZ-305.md": {
	id: "azure/AZ-305.md";
  slug: "azure/az-305";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"azure/AZ-400.md": {
	id: "azure/AZ-400.md";
  slug: "azure/az-400";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"azure/AZ-500.md": {
	id: "azure/AZ-500.md";
  slug: "azure/az-500";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"azure/AZ-700.md": {
	id: "azure/AZ-700.md";
  slug: "azure/az-700";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"azure/AZ-800.md": {
	id: "azure/AZ-800.md";
  slug: "azure/az-800";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"azure/AZ-801.md": {
	id: "azure/AZ-801.md";
  slug: "azure/az-801";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"azure/AZ-900.md": {
	id: "azure/AZ-900.md";
  slug: "azure/az-900";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"azure/DP-100.md": {
	id: "azure/DP-100.md";
  slug: "azure/dp-100";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"azure/DP-203.md": {
	id: "azure/DP-203.md";
  slug: "azure/dp-203";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"azure/DP-300.md": {
	id: "azure/DP-300.md";
  slug: "azure/dp-300";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"azure/DP-420.md": {
	id: "azure/DP-420.md";
  slug: "azure/dp-420";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"azure/DP-500.md": {
	id: "azure/DP-500.md";
  slug: "azure/dp-500";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"azure/DP-900.md": {
	id: "azure/DP-900.md";
  slug: "azure/dp-900";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"blog/newupdate.mdx": {
	id: "blog/newupdate.mdx";
  slug: "blog/newupdate";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"dynamics/MB-210.md": {
	id: "dynamics/MB-210.md";
  slug: "dynamics/mb-210";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"dynamics/MB-220.md": {
	id: "dynamics/MB-220.md";
  slug: "dynamics/mb-220";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"dynamics/MB-230.md": {
	id: "dynamics/MB-230.md";
  slug: "dynamics/mb-230";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"dynamics/MB-240.md": {
	id: "dynamics/MB-240.md";
  slug: "dynamics/mb-240";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"dynamics/MB-260.md": {
	id: "dynamics/MB-260.md";
  slug: "dynamics/mb-260";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"dynamics/MB-300.md": {
	id: "dynamics/MB-300.md";
  slug: "dynamics/mb-300";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"dynamics/MB-310.md": {
	id: "dynamics/MB-310.md";
  slug: "dynamics/mb-310";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"dynamics/MB-330.md": {
	id: "dynamics/MB-330.md";
  slug: "dynamics/mb-330";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"dynamics/MB-335.md": {
	id: "dynamics/MB-335.md";
  slug: "dynamics/mb-335";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"dynamics/MB-500.md": {
	id: "dynamics/MB-500.md";
  slug: "dynamics/mb-500";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"dynamics/MB-700.md": {
	id: "dynamics/MB-700.md";
  slug: "dynamics/mb-700";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"dynamics/MB-800.md": {
	id: "dynamics/MB-800.md";
  slug: "dynamics/mb-800";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"dynamics/MB-910.md": {
	id: "dynamics/MB-910.md";
  slug: "dynamics/mb-910";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"dynamics/MB-920.md": {
	id: "dynamics/MB-920.md";
  slug: "dynamics/mb-920";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"guide/certificationdashboard.md": {
	id: "guide/certificationdashboard.md";
  slug: "guide/certificationdashboard";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"guide/certificationprofile.md": {
	id: "guide/certificationprofile.md";
  slug: "guide/certificationprofile";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"guide/certificationrenewal.md": {
	id: "guide/certificationrenewal.md";
  slug: "guide/certificationrenewal";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"guide/introduction.md": {
	id: "guide/introduction.md";
  slug: "guide/introduction";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"guide/officialstudymaterials.md": {
	id: "guide/officialstudymaterials.md";
  slug: "guide/officialstudymaterials";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"guide/overview.md": {
	id: "guide/overview.md";
  slug: "guide/overview";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"guide/partneremployees.md": {
	id: "guide/partneremployees.md";
  slug: "guide/partneremployees";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"guide/studentopportunities.md": {
	id: "guide/studentopportunities.md";
  slug: "guide/studentopportunities";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"guide/takingtheexams.md": {
	id: "guide/takingtheexams.md";
  slug: "guide/takingtheexams";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"guide/voucherguide.md": {
	id: "guide/voucherguide.md";
  slug: "guide/voucherguide";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"index.mdx": {
	id: "index.mdx";
  slug: "index";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"microsoft365/MD-102.md": {
	id: "microsoft365/MD-102.md";
  slug: "microsoft365/md-102";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"microsoft365/MS-102.md": {
	id: "microsoft365/MS-102.md";
  slug: "microsoft365/ms-102";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"microsoft365/MS-203.md": {
	id: "microsoft365/MS-203.md";
  slug: "microsoft365/ms-203";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"microsoft365/MS-700.md": {
	id: "microsoft365/MS-700.md";
  slug: "microsoft365/ms-700";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"microsoft365/MS-721.md": {
	id: "microsoft365/MS-721.md";
  slug: "microsoft365/ms-721";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"microsoft365/MS-900.md": {
	id: "microsoft365/MS-900.md";
  slug: "microsoft365/ms-900";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"power/PL-100.md": {
	id: "power/PL-100.md";
  slug: "power/pl-100";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"power/PL-200.md": {
	id: "power/PL-200.md";
  slug: "power/pl-200";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"power/PL-300.md": {
	id: "power/PL-300.md";
  slug: "power/pl-300";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"power/PL-400.md": {
	id: "power/PL-400.md";
  slug: "power/pl-400";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"power/PL-500.md": {
	id: "power/PL-500.md";
  slug: "power/pl-500";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"power/PL-600.md": {
	id: "power/PL-600.md";
  slug: "power/pl-600";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"power/PL-900.md": {
	id: "power/PL-900.md";
  slug: "power/pl-900";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"security/SC-100.md": {
	id: "security/SC-100.md";
  slug: "security/sc-100";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"security/SC-200.md": {
	id: "security/SC-200.md";
  slug: "security/sc-200";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"security/SC-300.md": {
	id: "security/SC-300.md";
  slug: "security/sc-300";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"security/SC-400.md": {
	id: "security/SC-400.md";
  slug: "security/sc-400";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"security/SC-900.md": {
	id: "security/SC-900.md";
  slug: "security/sc-900";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"vouchers/Cloud Skills Challenges.md": {
	id: "vouchers/Cloud Skills Challenges.md";
  slug: "vouchers/cloud-skills-challenges";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"vouchers/Microsoft ESI.md": {
	id: "vouchers/Microsoft ESI.md";
  slug: "vouchers/microsoft-esi";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"vouchers/MindHub Replay Voucher Bundles.md": {
	id: "vouchers/MindHub Replay Voucher Bundles.md";
  slug: "vouchers/mindhub-replay-voucher-bundles";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"wiki.mdx": {
	id: "wiki.mdx";
  slug: "wiki";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	type ContentConfig = typeof import("../src/content/config");
}
