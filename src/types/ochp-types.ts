// src/types/ochp-types.ts

// SOAP module type declaration
declare module 'soap' {
  export function createClient(url: string, options?: any, callback?: (err: any, client: any) => void): void;
  export function createClientAsync(url: string, options?: any): Promise<any>;
}

export interface OCHPResult {
  resultCode: 'ok' | 'partly' | 'not-found' | 'server';
  resultDescription?: string;
}

export interface DirectResult {
  resultCode: 'ok' | 'partly' | 'not-found' | 'not-supported' | 'invalid-id' | 'server';
  resultDescription?: string;
}

export interface RoamingAuthorisationInfo {
  contractId: string;
  emtId: {
    instance: string;
    representation?: 'plain' | 'sha-160' | 'sha-256';
    tokenType: 'rfid' | 'remote';
    tokenSubType?: string;
  };
  printedNumber: string;
  expiryDate: string;
}

export interface ChargePointInfo {
  evseId: string;
  locationId: string;
  locationName: string;
  locationNameLang: string;
  address: {
    houseNumber: string;
    address: string;
    city: string;
    zipCode: string;
    country: string;
  };
  geoLocation: {
    lat: number;
    lon: number;
  };
  connectors: ConnectorInfo[];
  operatorName: string;
  operatorId: string;
  userInterfaceLang?: string[];
  authMethods?: ('Public' | 'LocalKey' | 'DirectPayment' | 'RfidMifare')[];
  paymentMethods?: ('Cash' | 'CreditCard' | 'DebitCard' | 'DirectDebit' | 'Token')[];
  accessibility?: ('Free' | 'PaidParking' | 'Customers' | 'Handicapped')[];
  locationDescription?: string;
  additionalInfo?: string;
  chargingWhenClosed?: boolean;
  images?: EvseImageUrl[];
  relatedResource?: RelatedResourceType[];
  chargePointSchedule?: ChargePointScheduleType[];
  hubjectStationId?: string;
  clearinghouseId?: string;
  timezone?: string;
  telephone?: string;
}

export interface ConnectorInfo {
  connectorId: number;
  connectorStandard: string;
  connectorFormat: 'Socket' | 'Cable';
  tariffId?: string;
}

export interface EvseImageUrl {
  uri: string;
  thumbUri: string;
  category: 'location' | 'entrance' | 'operator' | 'owner' | 'station' | 'connector' | 'other';
  type: string;
  width: number;
  height: number;
}

export interface RelatedResourceType {
  uri: string;
  class: string;
}

export interface ChargePointScheduleType {
  startDate: string;
  endDate: string;
  scheduleType: 'open' | 'closed' | 'unknown';
  openingTimes?: HoursType[];
}

export interface HoursType {
  regularHours: RegularHoursType[];
  exceptionalOpenings?: ExceptionalPeriodType[];
  exceptionalClosings?: ExceptionalPeriodType[];
}

export interface RegularHoursType {
  weekday: number;
  periodBegin: string;
  periodEnd: string;
}

export interface ExceptionalPeriodType {
  periodBegin: string;
  periodEnd: string;
}

export interface EvseStatusType {
  evseId: string;
  majorStatus: 'available' | 'not-available' | 'unknown';
  minorStatus?: string;
  ttl?: string;
}

export interface CDRInfo {
  cdrId: string;
  evseId: string;
  contractId: string;
  liveAuthId: string;
  emtId?: {
    instance: string;
    representation?: 'plain' | 'sha-160' | 'sha-256';
    tokenType: 'rfid' | 'remote';
    tokenSubType?: string;
  };
  status: 'approved' | 'declined' | 'pending';
  startDateTime: string;
  endDateTime: string;
  duration: string;
  houseNumber: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  chargePointType: string;
  connectorType: {
    connectorStandard: string;
    connectorFormat: 'Socket' | 'Cable';
  };
  maxSocketPower: number;
  productType: string;
  meterId: string;
  chargingPeriods: CdrPeriodType[];
}

export interface CdrPeriodType {
  startDateTime: string;
  endDateTime: string;
  billingItem: 'power' | 'energy' | 'parkingtime' | 'usagetime' | 'reservation';
  billingValue: number;
  itemPrice: number;
  periodCost: number;
}