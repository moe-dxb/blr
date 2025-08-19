// Global type declarations for missing modules

declare module 'lucide-react' {
  import { SVGProps, ForwardRefExoticComponent, RefAttributes } from 'react';
  
  export interface LucideProps extends SVGProps<SVGSVGElement> {
    size?: string | number;
    absoluteStrokeWidth?: boolean;
  }
  
  export type LucideIcon = ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
  >;
  
  // Common icons used in the project
  export const Activity: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const AlertTriangle: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const Award: LucideIcon;
  export const Bell: LucideIcon;
  export const BellRing: LucideIcon;
  export const Book: LucideIcon;
  export const BookOpen: LucideIcon;
  export const Briefcase: LucideIcon;
  export const Building: LucideIcon;
  export const Calendar: LucideIcon;
  export const CalendarDays: LucideIcon;
  export const Car: LucideIcon;
  export const Check: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const ChevronUp: LucideIcon;
  export const Circle: LucideIcon;
  export const CircleDollarSign: LucideIcon;
  export const Clock: LucideIcon;
  export const Cuboid: LucideIcon;
  export const Edit: LucideIcon;
  export const Edit2: LucideIcon;
  export const Edit3: LucideIcon;
  export const Eye: LucideIcon;
  export const EyeOff: LucideIcon;
  export const FileSignature: LucideIcon;
  export const FileText: LucideIcon;
  export const FileWarning: LucideIcon;
  export const Filter: LucideIcon;
  export const GraduationCap: LucideIcon;
  export const Heart: LucideIcon;
  export const Home: LucideIcon;
  export const Info: LucideIcon;
  export const Lightbulb: LucideIcon;
  export const Loader2: LucideIcon;
  export const LogOut: LucideIcon;
  export const Mail: LucideIcon;
  export const MapPin: LucideIcon;
  export const Megaphone: LucideIcon;
  export const Menu: LucideIcon;
  export const MessageSquare: LucideIcon;
  export const MoreHorizontal: LucideIcon;
  export const MoreVertical: LucideIcon;
  export const PanelLeft: LucideIcon;
  export const Phone: LucideIcon;
  export const Plus: LucideIcon;
  export const PlusCircle: LucideIcon;
  export const RefreshCw: LucideIcon;
  export const Save: LucideIcon;
  export const Search: LucideIcon;
  export const Settings: LucideIcon;
  export const Shield: LucideIcon;
  export const ShieldCheck: LucideIcon;
  export const Sparkles: LucideIcon;
  export const Star: LucideIcon;
  export const ThumbsDown: LucideIcon;
  export const ThumbsUp: LucideIcon;
  export const Trash: LucideIcon;
  export const Trash2: LucideIcon;
  export const Upload: LucideIcon;
  export const User: LucideIcon;
  export const Users: LucideIcon;
  export const X: LucideIcon;
  export const Zap: LucideIcon;
}

declare module 'firebase/firestore' {
  export * from 'firebase/firestore/lite';
  
  export interface FirebaseFirestore {
    app: any;
    _delegate: any;
  }
  
  export interface DocumentData {
    [field: string]: any;
  }
  
  export interface DocumentSnapshot<T = DocumentData> {
    readonly id: string;
    readonly ref: DocumentReference<T>;
    readonly metadata: SnapshotMetadata;
    data(): T | undefined;
    get(fieldPath: string | FieldPath): any;
    exists(): boolean;
  }
  
  export interface QuerySnapshot<T = DocumentData> {
    readonly docs: QueryDocumentSnapshot<T>[];
    readonly empty: boolean;
    readonly metadata: SnapshotMetadata;
    readonly size: number;
    docChanges(): DocumentChange<T>[];
    forEach(callback: (result: QueryDocumentSnapshot<T>) => void): void;
  }
  
  export interface QueryDocumentSnapshot<T = DocumentData> extends DocumentSnapshot<T> {
    data(): T;
  }
  
  export interface DocumentChange<T = DocumentData> {
    readonly doc: QueryDocumentSnapshot<T>;
    readonly newIndex: number;
    readonly oldIndex: number;
    readonly type: DocumentChangeType;
  }
  
  export type DocumentChangeType = 'added' | 'removed' | 'modified';
  
  export interface DocumentReference<T = DocumentData> {
    readonly id: string;
    readonly path: string;
    readonly parent: CollectionReference<T>;
  }
  
  export interface CollectionReference<T = DocumentData> extends Query<T> {
    readonly id: string;
    readonly path: string;
    readonly parent: DocumentReference<DocumentData> | null;
  }
  
  export interface Query<T = DocumentData> {
    readonly firestore: FirebaseFirestore;
  }
  
  export interface SnapshotMetadata {
    readonly fromCache: boolean;
    readonly hasPendingWrites: boolean;
  }
  
  export interface FieldPath {
    readonly _path: any;
  }
  
  export interface Timestamp {
    readonly seconds: number;
    readonly nanoseconds: number;
    toDate(): Date;
    toMillis(): number;
    isEqual(other: Timestamp): boolean;
    toString(): string;
    valueOf(): string;
  }
  
  export function getFirestore(app?: any): FirebaseFirestore;
  export function collection(firestore: FirebaseFirestore, path: string, ...pathSegments: string[]): CollectionReference<DocumentData>;
  export function collectionGroup(firestore: FirebaseFirestore, collectionId: string): Query<DocumentData>;
  export function doc(firestore: FirebaseFirestore, path: string, ...pathSegments: string[]): DocumentReference<DocumentData>;
  export function addDoc<T>(reference: CollectionReference<T>, data: T): Promise<DocumentReference<T>>;
  export function setDoc<T>(reference: DocumentReference<T>, data: T, options?: any): Promise<void>;
  export function updateDoc<T>(reference: DocumentReference<T>, data: Partial<T>): Promise<void>;
  export function deleteDoc(reference: DocumentReference<any>): Promise<void>;
  export function getDoc<T>(reference: DocumentReference<T>): Promise<DocumentSnapshot<T>>;
  export function getDocs<T>(query: Query<T>): Promise<QuerySnapshot<T>>;
  export function onSnapshot<T>(reference: DocumentReference<T>, onNext: (snapshot: DocumentSnapshot<T>) => void, onError?: (error: Error) => void): () => void;
  export function onSnapshot<T>(query: Query<T>, onNext: (snapshot: QuerySnapshot<T>) => void, onError?: (error: Error) => void): () => void;
  export function query<T>(query: Query<T>, ...queryConstraints: any[]): Query<T>;
  export function where(fieldPath: string | FieldPath, opStr: any, value: any): any;
  export function orderBy(fieldPath: string | FieldPath, directionStr?: 'asc' | 'desc'): any;
  export function limit(limit: number): any;
  export function serverTimestamp(): any;
  export function arrayUnion(...elements: any[]): any;
  export function arrayRemove(...elements: any[]): any;
  export function increment(n: number): any;
  export function runTransaction<T>(firestore: FirebaseFirestore, updateFunction: (transaction: any) => Promise<T>): Promise<T>;
  
  export class Timestamp {
    readonly seconds: number;
    readonly nanoseconds: number;
    constructor(seconds: number, nanoseconds: number);
    toDate(): Date;
    toMillis(): number;
    isEqual(other: Timestamp): boolean;
    toString(): string;
    valueOf(): string;
    static now(): Timestamp;
    static fromDate(date: Date): Timestamp;
    static fromMillis(milliseconds: number): Timestamp;
  }
}

declare module 'firebase/functions' {
  export interface Functions {
    app: any;
    region: string;
    customDomain?: string;
  }
  
  export interface HttpsCallable<T = any, R = any> {
    (data?: T): Promise<HttpsCallableResult<R>>;
  }
  
  export interface HttpsCallableResult<T = any> {
    readonly data: T;
  }
  
  export function getFunctions(app?: any, regionOrCustomDomain?: string): Functions;
  export function httpsCallable<T = any, R = any>(functions: Functions, name: string): HttpsCallable<T, R>;
  export function connectFunctionsEmulator(functions: Functions, host: string, port: number): void;
}

declare module 'firebase/storage' {
  export interface FirebaseStorage {
    app: any;
    maxOperationRetryTime: number;
    maxUploadRetryTime: number;
  }
  
  export interface StorageReference {
    bucket: string;
    fullPath: string;
    name: string;
    parent: StorageReference | null;
    root: StorageReference;
    storage: FirebaseStorage;
  }
  
  export interface UploadTask {
    snapshot: UploadTaskSnapshot;
    catch(onRejected?: ((a: Error) => any) | null): Promise<any>;
    then<T, U>(onFulfilled?: ((a: UploadTaskSnapshot) => T | Promise<T>) | null, onRejected?: ((a: Error) => U | Promise<U>) | null): Promise<T | U>;
    on(event: string, nextOrObserver?: any, error?: any, complete?: any): any;
    pause(): boolean;
    resume(): boolean;
    cancel(): boolean;
  }
  
  export interface UploadTaskSnapshot {
    bytesTransferred: number;
    metadata: any;
    ref: StorageReference;
    state: string;
    task: UploadTask;
    totalBytes: number;
  }
  
  export interface DownloadURL {
    toString(): string;
  }
  
  export function getStorage(app?: any): FirebaseStorage;
  export function ref(storage: FirebaseStorage | StorageReference, path?: string): StorageReference;
  export function uploadBytes(ref: StorageReference, data: Blob | Uint8Array | ArrayBuffer): Promise<UploadTaskSnapshot>;
  export function uploadBytesResumable(ref: StorageReference, data: Blob | Uint8Array | ArrayBuffer, metadata?: any): UploadTask;
  export function getDownloadURL(ref: StorageReference): Promise<string>;
  export function deleteObject(ref: StorageReference): Promise<void>;
  export function list(ref: StorageReference, options?: any): Promise<any>;
  export function listAll(ref: StorageReference): Promise<any>;
  export function getMetadata(ref: StorageReference): Promise<any>;
  export function updateMetadata(ref: StorageReference, metadata: any): Promise<any>;
}

declare module 'firebase/performance' {
  export interface FirebasePerformance {
    app: any;
  }
  
  export interface Trace {
    readonly name: string;
    start(): void;
    stop(): void;
    incrementMetric(metricName: string, num?: number): void;
    putMetric(metricName: string, num: number): void;
    getMetric(metricName: string): number;
    putAttribute(attrName: string, attrValue: string): void;
    getAttribute(attrName: string): string | undefined;
    removeAttribute(attrName: string): void;
    getAttributes(): { [key: string]: string };
  }
  
  export function getPerformance(app?: any): FirebasePerformance;
  export function trace(performance: FirebasePerformance, name: string): Trace;
}