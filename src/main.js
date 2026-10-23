
const Phaser = window.Phaser;

// ========================================
// PANTALLA DE INICIO
// ========================================

class EscenaInicio extends Phaser.Scene {
    constructor() {
        super('EscenaInicio');
    }

    create() {
        // FONDO OSCURO
        this.add.rectangle(
            640, 360, 1280, 720, 0x17171f
        );

        // TÍTULO
        this.add.text(640, 245, '¿DÓNDE ESTÁ', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '76px',
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(640, 340, 'PEDRO?', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '100px',
            fontStyle: 'bold',
            color: '#ff5252',
            align: 'center'
        }).setOrigin(0.5);

        // BOTÓN JUGAR
        const botonJugar = this.add.rectangle(
            640, 500, 260, 75, 0xb22222
        )
            .setInteractive({ useHandCursor: true });

        this.add.text(640, 500, 'JUGAR', {
            fontFamily: 'Arial',
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        // EFECTO AL PASAR EL MOUSE
        botonJugar.on('pointerover', () => {
            botonJugar.setFillStyle(0xe03333);
        });

        botonJugar.on('pointerout', () => {
            botonJugar.setFillStyle(0xb22222);
        });

        // ENTRAR AL JUEGO
        botonJugar.on('pointerdown', () => {
            this.scene.start('EscenaCuarto');
        });
    }
}

// ========================================
// JUEGO PRINCIPAL
// ========================================

class EscenaCuarto extends Phaser.Scene {
    constructor() {
        super('EscenaCuarto');
    }

    preload() {
        this.load.image('cuarto', './public/assets/cuarto-pedro.png');
        this.load.image('bong', './public/assets/bong-rosa.png');
        this.load.image('ganaste', './public/assets/ganaste%20papa.png');
        this.load.image('cajonera', './public/assets/cajon.png');
        this.load.image('suar', './public/assets/suar.png');
    }

    create() {
        this.inventario = [];
        this.objetoSeleccionado = null;
        this.acertijoResuelto = false;
        this.mensajeActual = null;
        this.vistaCajonera = false;
        this.llaveRecogida = false;
        this.panelCajonera = null;

        // FONDO DEL CUARTO
        this.add.image(0, 0, 'cuarto')
            .setOrigin(0, 0)
            .setDisplaySize(1280, 720);

        // INVENTARIO
        this.add.rectangle(
            640, 680, 1280, 80, 0x292929
        ).setDepth(50);

        this.add.text(20, 652, 'INVENTARIO', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff'
        }).setDepth(51);

        this.casillas = [];

        for (let i = 0; i < 6; i++) {
            const casilla = this.add.rectangle(
                200 + i * 80,
                680,
                70,
                70,
                0x444444
            )
                .setStrokeStyle(2, 0xffffff)
                .setDepth(51);

            this.casillas.push(casilla);
        }

        // BONG EN LA VENTANA
        const bong = this.add.image(555, 290, 'bong')
            .setOrigin(0.5, 1)
            .setDisplaySize(63, 75)
            .setInteractive({ useHandCursor: true });

        bong.on('pointerdown', () => {
            if (this.vistaCajonera || this.acertijoResuelto) return;

            bong.destroy();
            this.inventario.push('bong');

            const item = this.add.image(200, 680, 'bong')
                .setDisplaySize(63, 65)
                .setDepth(52)
                .setInteractive({ useHandCursor: true });

            item.on('pointerdown', () => {
                if (this.vistaCajonera || this.acertijoResuelto) return;
                this.seleccionarObjeto('bong');
            });

            this.mostrarMensaje('Recogiste el bong rosa');
        });

        // COMPUTADORA
        const computadora = this.add.zone(
            1060, 330, 260, 180
        ).setInteractive({ useHandCursor: true });

        computadora.on('pointerdown', () => {
            if (this.vistaCajonera || this.acertijoResuelto) return;

            if (this.objetoSeleccionado === 'bong') {
                this.acertijoResuelto = true;
                this.mostrarVictoria();
            } else {
                this.mostrarMensaje(
                    'Hay algo en la computadora, pero necesito un objeto.'
                );
            }
        });

        // PUERTA
        const puerta = this.add.zone(
            65, 340, 130, 450
        ).setInteractive({ useHandCursor: true });

        puerta.on('pointerdown', () => {
            if (this.vistaCajonera || this.acertijoResuelto) return;

            this.mostrarMensaje(
                'Todavía tengo que resolver algo en este cuarto.'
            );
        });

        // CAJONERA DEL ESCRITORIO
        const zonaCajonera = this.add.zone(
            966, 460, 110, 155
        ).setInteractive({ useHandCursor: true });

        zonaCajonera.on('pointerdown', () => {
            if (this.vistaCajonera || this.acertijoResuelto) return;

            this.abrirCajonera();
        });

        // NPC - ADRIÁN SUAR
        const suar = this.add.image(350, 410, 'suar')
            .setDisplaySize(235, 445)
            .setDepth(10)
            .setInteractive({ useHandCursor: true });

        // DIÁLOGO DE SUAR
        suar.on('pointerdown', () => {
            if (this.vistaCajonera || this.acertijoResuelto) return;

            this.mostrarMensaje(
                'Hola, soy Adrián Suar, obviamente. Agarrá el bong y ponelo en la segunda tele.'
            );
        });

        // BOTÓN REINICIAR
        const boton = this.add.rectangle(
            1170, 35, 185, 48, 0xb22222
        )
            .setStrokeStyle(2, 0xffffff)
            .setDepth(200)
            .setInteractive({ useHandCursor: true });

        this.add.text(1170, 35, 'REINICIAR', {
            fontFamily: 'Arial',
            fontSize: '21px',
            fontStyle: 'bold',
            color: '#ffffff'
        })
            .setOrigin(0.5)
            .setDepth(201);

        boton.on('pointerdown', () => {
            this.scene.restart();
        });

        boton.on('pointerover', () => {
            boton.setFillStyle(0xff3333);
        });

        boton.on('pointerout', () => {
            boton.setFillStyle(0xb22222);
        });
    }

    // SELECCIONAR OBJETOS DEL INVENTARIO
    seleccionarObjeto(nombre) {
        if (this.objetoSeleccionado === nombre) {
            this.objetoSeleccionado = null;
        } else {
            this.objetoSeleccionado = nombre;
        }

        this.casillas.forEach((casilla, i) => {
            const seleccionado =
                (i === 0 && this.objetoSeleccionado === 'bong') ||
                (i === 1 && this.objetoSeleccionado === 'llave');

            casilla.setStrokeStyle(
                seleccionado ? 4 : 2,
                seleccionado ? 0xff0000 : 0xffffff
            );
        });
    }

    // ABRIR VISTA AMPLIADA DE LA CAJONERA
    abrirCajonera() {
        this.vistaCajonera = true;

        if (this.mensajeActual) {
            this.mensajeActual.destroy();
            this.mensajeActual = null;
        }

        const panel = this.add.container(0, 0);
        panel.setDepth(100);
        this.panelCajonera = panel;

        // OSCURECER EL CUARTO
        const fondo = this.add.rectangle(
            640, 320, 1280, 640, 0x000000, 0.9
        ).setInteractive();

        panel.add(fondo);

        // TÍTULO
        const titulo = this.add.text(
            640, 55, 'CAJONERA', {
                fontFamily: 'Arial',
                fontSize: '38px',
                fontStyle: 'bold',
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        panel.add(titulo);

        // IMAGEN AMPLIADA DE LA CAJONERA
        const mueble = this.add.image(
            640, 340, 'cajonera'
        );

        const escala = Math.min(
            410 / mueble.width,
            450 / mueble.height
        );

        mueble.setScale(escala);
        panel.add(mueble);

        const ancho = mueble.displayWidth;
        const alto = mueble.displayHeight;

        const izquierda = 640 - ancho / 2;
        const arriba = 340 - alto / 2;

        // TRES CAJONES INTERACTIVOS
        const posiciones = [
            { x: 0.40, y: 0.35 },
            { x: 0.40, y: 0.54 },
            { x: 0.40, y: 0.74 }
        ];

        posiciones.forEach((pos, indice) => {
            const zona = this.add.zone(
                izquierda + ancho * pos.x,
                arriba + alto * pos.y,
                ancho * 0.45,
                alto * 0.15
            ).setInteractive({ useHandCursor: true });

            zona.on('pointerdown', () => {
                this.revisarCajon(indice);
            });

            panel.add(zona);
        });

        // BOTÓN VOLVER
        const volver = this.add.rectangle(
            640, 585, 200, 50, 0xb22222
        )
            .setStrokeStyle(2, 0xffffff)
            .setInteractive({ useHandCursor: true });

        const textoVolver = this.add.text(
            640, 585, 'VOLVER', {
                fontFamily: 'Arial',
                fontSize: '23px',
                fontStyle: 'bold',
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        volver.on('pointerdown', () => {
            this.cerrarCajonera();
        });

        panel.add([volver, textoVolver]);
    }

    // MECÁNICA DE LOS CAJONES
    revisarCajon(indice) {
        if (indice !== 0) return;
        if (this.llaveRecogida) return;

        this.llaveRecogida = true;
        this.inventario.push('llave');

        // LLAVE EN EL INVENTARIO
        const llave = this.add.text(
            280, 680, '🔑', {
                fontFamily: 'Arial',
                fontSize: '32px',
                padding: {
                    x: 10,
                    y: 10
                }
            }
        )
            .setOrigin(0.5)
            .setDepth(52)
            .setInteractive({ useHandCursor: true });

        llave.on('pointerdown', () => {
            if (this.vistaCajonera || this.acertijoResuelto) return;
            this.seleccionarObjeto('llave');
        });

        this.mostrarMensaje('Encontraste una llave.');
    }

    // VOLVER AL CUARTO
    cerrarCajonera() {
        if (this.panelCajonera) {
            this.panelCajonera.destroy();
            this.panelCajonera = null;
        }

        this.vistaCajonera = false;

        if (this.mensajeActual) {
            this.mensajeActual.destroy();
            this.mensajeActual = null;
        }
    }

    // PANTALLA DE VICTORIA
    mostrarVictoria() {
        if (this.mensajeActual) {
            this.mensajeActual.destroy();
            this.mensajeActual = null;
        }

        this.add.rectangle(
            640, 360, 1280, 720, 0x000000
        ).setDepth(100);

        this.add.text(640, 105, '¡BIEN LOCO!', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '80px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#ff0000',
            strokeThickness: 8
        })
            .setOrigin(0.5)
            .setDepth(101);

        const imagen = this.add.image(
            640, 395, 'ganaste'
        );

        const escala = Math.min(
            850 / imagen.width,
            450 / imagen.height
        );

        imagen.setScale(escala);
        imagen.setDepth(101);

        this.add.text(
            640, 660, 'ACERTIJO RESUELTO', {
                fontFamily: 'Arial',
                fontSize: '28px',
                color: '#ffffff'
            }
        )
            .setOrigin(0.5)
            .setDepth(101);
    }

    // MENSAJES TEMPORALES
    mostrarMensaje(texto) {
        if (this.mensajeActual) {
            this.mensajeActual.destroy();
        }

        this.mensajeActual = this.add.text(
            640, 570, texto, {
                fontFamily: 'Arial',
                fontSize: '23px',
                color: '#ffffff',
                backgroundColor: '#222222',
                padding: { x: 15, y: 12 },
                align: 'center',
                wordWrap: { width: 900 }
            }
        )
            .setOrigin(0.5)
            .setDepth(150);

        const mensaje = this.mensajeActual;

        this.time.delayedCall(3000, () => {
            if (mensaje.active) {
                mensaje.destroy();
            }

            if (this.mensajeActual === mensaje) {
                this.mensajeActual = null;
            }
        });
    }
}

// ========================================
// CONFIGURACIÓN DEL JUEGO
// ========================================

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [EscenaInicio, EscenaCuarto]
};

new Phaser.Game(config);
