import React, { useState, useRef } from 'react';
import {StyleSheet, View, Text, TouchableOpacity, TextInput, Dimensions, ScrollView, Alert} from 'react-native';
import { GameEngine } from 'react-native-game-engine';
import Matter from 'matter-js';
import { useNavigation } from '@react-navigation/native';
import {MaterialCommunityIcons} from "@expo/vector-icons";

const { width, height } = Dimensions.get('window');

const colors = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'cyan'];

const Physics = (entities, { time }) => {
    let engine = entities.physics.engine;
    let delta = time.delta;

    if (delta > 16.667) {
        delta = 16.667;
    }

    Matter.Engine.update(engine, delta);

    Object.values(entities).forEach(entity => {
        if (entity.body && entity.body.label === 'ball') {
            const speed = Math.sqrt(entity.body.velocity.x ** 2 + entity.body.velocity.y ** 2);

            // 속도가 일정 이하로 떨어지지 않도록 속도를 유지
            if (speed < 5) {
                Matter.Body.setVelocity(entity.body, {
                    x: entity.body.velocity.x * 1.1,
                    y: entity.body.velocity.y * 1.1,
                });
            }
        }
    });

    return entities;
};

const createBall = (world, color, pos, radius, name) => {
    let ball = Matter.Bodies.circle(pos.x, pos.y, radius, {
        restitution: 0.9,
        frictionAir: 0.001, // 공기 저항을 최소화
        friction: 0, // 마찰을 최소화
        label: 'ball',
    });
    ball.name = name; // 공의 이름을 저장
    Matter.World.add(world, [ball]);

    return {
        body: ball,
        color,
        radius,
        name,
        renderer: <Ball />
    };
};

const createWall = (world, color, pos, size, angle = 0) => {
    let wall = Matter.Bodies.rectangle(pos.x, pos.y, size.width, size.height, {
        isStatic: true,
        angle: angle,
        label: 'wall'
    });
    Matter.World.add(world, [wall]);

    return {
        body: wall,
        color,
        size,
        angle,
        renderer: <Wall />
    };
};

const createHole = (world, pos, radius) => {
    let hole = Matter.Bodies.circle(pos.x, pos.y, radius, {
        isStatic: true,
        isSensor: true,
        label: 'hole'
    });
    Matter.World.add(world, [hole]);

    return {
        body: hole,
        radius,
        renderer: <Hole />
    };
};

const Ball = (props) => {
    const { body, radius, color, name } = props;
    const x = body.position.x - radius;
    const y = body.position.y - radius;

    return (
        <View style={[styles.ball, { left: x, top: y, width: radius * 2, height: radius * 2 }]}>
            <View style={[styles.ballInner, { backgroundColor: color, width: radius * 2, height: radius * 2 }]} />
            <Text style={styles.ballText}>{name}</Text>
        </View>
    );
};

const Wall = (props) => {
    const { body, size, color, angle } = props;
    const width = size.width;
    const height = size.height;
    const x = body.position.x - width / 2;
    const y = body.position.y - height / 2;
    const transform = [{ translateX: x }, { translateY: y }, { rotate: `${angle}rad` }];

    return (
        <View style={[styles.wall, { width, height, backgroundColor: color, transform }]} />
    );
};

const Hole = (props) => {
    const { body, radius } = props;
    const x = body.position.x - radius;
    const y = body.position.y - radius;

    return (
        <View style={[styles.hole, { left: x, top: y, width: radius * 2, height: radius * 2 }]} />
    );
};

export default function PinBall() {
    const [running, setRunning] = useState(false);
    const [numPlayers, setNumPlayers] = useState('');
    const [numBallsPerPlayer, setNumBallsPerPlayer] = useState('');
    const [playerNames, setPlayerNames] = useState({});
    const [entities, setEntities] = useState(null);
    const [showSettings, setShowSettings] = useState(true);
    const [showPopup, setShowPopup] = useState(false);
    const [lastBallName, setLastBallName] = useState('');
    const gameEngine = useRef(null);

    const navigation = useNavigation();

    const handleNameChange = (playerIndex, name) => {
        setPlayerNames(prevNames => ({
            ...prevNames,
            [playerIndex]: name,
        }));
    };

    const initializeGame = () => {
        let engine = Matter.Engine.create({ enableSleeping: false });
        let world = engine.world;

        // 중력 비활성화
        engine.world.gravity.y = 0;
        engine.world.gravity.x = 0;

        let players = parseInt(numPlayers, 10);
        let ballsPerPlayer = parseInt(numBallsPerPlayer, 10);

        if (isNaN(players) || players < 2 || players > 8 || isNaN(ballsPerPlayer) || ballsPerPlayer < 1 || ballsPerPlayer > 3) {
            Alert.alert('',"참가자 수(2-8)와 공의 개수(1-3)를 입력해주세요.");
            return;
        }

        let balls = [];
        const ballRadius = 10;
        const initialX = width / 2;
        const initialY = height / 2;

        for (let player = 0; player < players; player++) {
            const color = colors[player % colors.length];
            const name = playerNames[player] || `Player ${player + 1}`;

            for (let ball = 0; ball < ballsPerPlayer; ball++) {
                let angle = (2 * Math.PI / (players * ballsPerPlayer)) * (player * ballsPerPlayer + ball);
                let posX = initialX + Math.cos(angle) * (ballRadius * 3);
                let posY = initialY + Math.sin(angle) * (ballRadius * 3);
                let newBall = createBall(world, color, { x: posX, y: posY }, ballRadius, name);
                balls.push(newBall);
            }
        }

        let walls = [
            createWall(world, 'blue', { x: width / 2, y: 50 }, { width: width - 20, height: 20 }),
            createWall(world, 'blue', { x: width / 2, y: height - 50 }, { width: width - 20, height: 20 }),
            createWall(world, 'red', { x: 50, y: height / 2 }, { width: 20, height: height - 20 }),
            createWall(world, 'green', { x: width - 50, y: height / 2 }, { width: 20, height: height - 20 }),
        ];

        let holes = [
            createHole(world, { x: 50, y: 50 }, 20),
            createHole(world, { x: width - 50, y: 50 }, 20),
            createHole(world, { x: 50, y: height - 50 }, 20),
            createHole(world, { x: width - 50, y: height - 50 }, 20),
            createHole(world, { x: 50, y: height / 2 }, 20), // 왼쪽 벽 가운데 구멍
            createHole(world, { x: width - 50, y: height / 2 }, 20), // 오른쪽 벽 가운데 구멍
        ];

        const newEntities = {
            physics: { engine, world },
            ...balls.reduce((acc, ball, idx) => {
                acc[`ball_${idx}`] = ball;
                return acc;
            }, {}),
            ...walls.reduce((acc, wall, idx) => {
                acc[`wall_${idx}`] = wall;
                return acc;
            }, {}),
            ...holes.reduce((acc, hole, idx) => {
                acc[`hole_${idx}`] = hole;
                return acc;
            }, {})
        };

        setEntities(newEntities);

        setShowSettings(false);
        setShowPopup(false);
        setRunning(false);

        // 충돌 이벤트 핸들러 설정
        Matter.Events.on(engine, 'collisionStart', (event) => {
            const { pairs } = event;
            pairs.forEach(pair => {
                const { bodyA, bodyB } = pair;
                if ((bodyA.label === 'hole' && bodyB.label === 'ball') || (bodyB.label === 'hole' && bodyA.label === 'ball')) {
                    const ballBody = bodyA.label === 'ball' ? bodyA : bodyB;
                    const ballKey = Object.keys(newEntities).find(key => newEntities[key].body === ballBody);
                    if (ballKey) {
                        Matter.World.remove(world, ballBody);
                        delete newEntities[ballKey];
                        checkLastBall(world);
                    }
                }
            });
        });
    };

    const checkLastBall = (world) => {
        const remainingBalls = Object.values(world.bodies).filter(
            body => body.label === 'ball'
        );

        if (remainingBalls.length === 1) {
            const lastBall = remainingBalls[0];
            setLastBallName(lastBall.name);
            setShowPopup(true);
            setRunning(false);
        }
    };

    const startGame = () => {
        if (!running && !showSettings) {
            setRunning(true);
            Object.values(entities).forEach(entity => {
                if (entity.body && entity.body.label === 'ball') {
                    Matter.Body.setVelocity(entity.body, {
                        x: (Math.random() - 0.5) * 30, // 초기 속도 증가
                        y: (Math.random() - 0.5) * 30  // 초기 속도 증가
                    });
                }
            });
        }
    };

    const ExitGame = () => {
        setEntities(null);
        setShowSettings(true);
        setShowPopup(false);
        setRunning(false);
        setNumPlayers('');
        setNumBallsPerPlayer('');
        setPlayerNames({});
    };


    return (
        <View style={styles.container}>

                {entities && (
                    <TouchableOpacity style={styles.touchableArea} onPress={startGame} disabled={showSettings} activeOpacity={1}>
                        <View style={styles.backButtonContainer}>
                            <TouchableOpacity onPress={ExitGame} style={styles.backButton}>
                                <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
                            </TouchableOpacity>
                            <Text style={styles.backButtonText}>게임 설정으로 돌아가기</Text>
                        </View>

                        <GameEngine
                        ref={gameEngine}
                        style={styles.gameContainer}
                        systems={[Physics]}
                        entities={entities}
                        running={running}
                        onEvent={(e) => {
                            if (e.type === 'game-over') {
                                setRunning(false);
                            }
                        }}
                         />
                    </TouchableOpacity>

                )}

            {showSettings && (
                <View>
                <View style={styles.header}>
                    <Text style={styles.headerText}>핀볼 미니 게임</Text>
                </View>

                <View style={styles.controls}>
                    <TextInput
                        style={styles.input}
                        placeholder="참가자 수를 입력해 주세요. (2-8)"
                        value={numPlayers}
                        onChangeText={setNumPlayers}
                        keyboardType="numeric"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="공의 개수를 입력해 주세요. (1-3)"
                        value={numBallsPerPlayer}
                        onChangeText={setNumBallsPerPlayer}
                        keyboardType="numeric"
                    />
                    <ScrollView>
                        {[...Array(parseInt(numPlayers) || 0)].map((_, index) => (
                            <TextInput
                                key={index}
                                style={styles.input}
                                placeholder={`참가자 ${index + 1}의 이름을 입력해주세요.`}
                                value={playerNames[index]}
                                onChangeText={(text) => handleNameChange(index, text)}
                            />
                        ))}
                    </ScrollView>
                    <TouchableOpacity onPress={initializeGame} style={styles.button}>
                        <Text style={styles.buttonText}>게임시작</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={() => navigation.navigate("Main")} style={styles.button}>
                        <Text style={styles.buttonText}>메인으로 돌아가기</Text>
                    </TouchableOpacity>
                </View>
                </View>
            )}
            {showPopup && (
                <View style={styles.popup}>
                    <Text style={styles.popupText}>당첨: {lastBallName}</Text>
                    <TouchableOpacity onPress={ExitGame} style={styles.button}>
                        <Text style={styles.buttonText}>Exit</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    gameContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    touchableArea: {
        flex: 1,
    },
    ball: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ballInner: {
        borderRadius: 50,
    },
    ballText: {
        position: 'absolute',
        top: -20, // 공 위쪽에 표시되도록 설정
        width: 50,
        textAlign: 'center',
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    wall: {
        position: 'absolute',
    },
    hole: {
        position: 'absolute',
        backgroundColor: 'black',
        borderRadius: 50,
    },
    controls: {
        // position: 'absolute',
        // bottom: 50,
        // left: '50%',
        // transform: [{ translateX: -50 }],
        alignItems: 'center',
        paddingTop:'60%'
    },
    input: {
        width: 200,
        height: 40,
        backgroundColor: 'white',
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    button: {
        padding: 10,
        backgroundColor: 'black',
        marginBottom: 10,
    },
    buttonText: {
        color: 'white',
    },
    popup: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -width * 0.4 }, { translateY: -100 }],
        width: width * 0.8,
        height: 200,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        padding: 20,
    },
    popupText: {
        fontSize: 18,
        marginBottom: 20,
    },
    header:{
        paddingTop:'15%',

    },
    headerText:{
        textAlign: 'center',
        color: 'white',
        fontWeight:"bold",
        fontSize: 25
    },
    backButtonContainer:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        marginTop: 20,
        marginBottom: 10,
    },
    backButton:{

    },
    backButtonText:{
        color: 'white',
        textAlign:'left',
        flex: 1,
    }
});
