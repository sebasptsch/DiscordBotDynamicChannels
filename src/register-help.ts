import { Helps } from './classes/Help';
import { AliasHelp } from './help/alias';
import { AllowjoinHelp } from './help/allowjoin';
import { AllyourbaseHelp } from './help/allyourbase';
import { BitrateHelp } from './help/bitrate';
import { CreateHelp } from './help/create';
import { GeneralHelp } from './help/general';
import { HelpHelp } from './help/help';
import { InfoHelp } from './help/info';
import { JoinHelp } from './help/join';
import { LimitHelp } from './help/limit';
import { LockHelp } from './help/lock';
import { NameHelp } from './help/name';
import { PermissionHelp } from './help/permission';
import { PingHelp } from './help/ping';
import { TemplateHelp } from './help/template';
import { TransferHelp } from './help/transfer';
import { UnlockHelp } from './help/unlock';
import { VersionHelp } from './help/version';

export class RegisterHelp {
  constructor() {
    Helps.register(new AliasHelp());
    Helps.register(new AllowjoinHelp());
    Helps.register(new AllyourbaseHelp());
    Helps.register(new BitrateHelp());
    Helps.register(new CreateHelp());
    Helps.register(new GeneralHelp());
    Helps.register(new HelpHelp());
    Helps.register(new InfoHelp());
    Helps.register(new JoinHelp());
    Helps.register(new LimitHelp());
    Helps.register(new LockHelp());
    Helps.register(new NameHelp());
    Helps.register(new PermissionHelp());
    Helps.register(new PingHelp());
    Helps.register(new TemplateHelp());
    Helps.register(new TransferHelp());
    Helps.register(new UnlockHelp());
    Helps.register(new VersionHelp());
  }
}
